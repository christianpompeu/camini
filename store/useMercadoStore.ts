/**
 * CAMINI MERCADO — Store Zustand para Gerenciamento de Carrinhos Offline-First
 */

import { create } from "zustand";
import {
  MercadoCarrinho,
  MercadoItem,
  CreateItemPayload,
  UpdateItemPayload,
  FinalizarCarrinhoPayload,
  StatusSincronizacao,
} from "@/types/mercado";
import { generateDefaultCartName } from "@/lib/mercado/utils";
import {
  loadCarrinhosFromStorage,
  saveCarrinhosToStorage,
} from "@/lib/mercado/indexeddb";
import {
  syncCartsWithSupabase,
  checkAuthUser,
} from "@/lib/mercado/supabase-sync";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface MercadoStoreState {
  carrinhos: MercadoCarrinho[];
  carrinhoAtivoId: string | null;
  isInitialized: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncError: string | null;
  user: any | null;

  // Ações Principais
  init: () => Promise<void>;
  createCart: (customName?: string) => MercadoCarrinho;
  setActiveCart: (id: string) => void;
  getActiveCart: () => MercadoCarrinho | null;
  renameCart: (id: string, newName: string) => void;
  deleteCart: (id: string) => void;

  // Itens
  addItem: (carrinhoId: string, payload: CreateItemPayload) => MercadoItem;
  updateItem: (carrinhoId: string, itemId: string, payload: UpdateItemPayload) => void;
  updateItemQuantity: (carrinhoId: string, itemId: string, change: number, isAbsolute?: boolean) => void;
  deleteItem: (carrinhoId: string, itemId: string) => void;

  // Finalização & Status
  finishCart: (carrinhoId: string, payload?: FinalizarCarrinhoPayload) => void;
  reopenCart: (carrinhoId: string) => void;

  // Sincronização
  syncNow: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export const useMercadoStore = create<MercadoStoreState>((set, get) => ({
  carrinhos: [],
  carrinhoAtivoId: null,
  isInitialized: false,
  isSyncing: false,
  lastSyncTime: null,
  syncError: null,
  user: null,

  init: async () => {
    if (get().isInitialized) return;

    // 1. Carregar do armazenamento local (IndexedDB com fallback para LocalStorage)
    const localCarts = await loadCarrinhosFromStorage();

    // 2. Verificar autenticação Supabase
    const user = await checkAuthUser();

    let initialCarts = localCarts;
    let activeId: string | null = null;

    // Se houver carrinhos locais
    if (initialCarts.length > 0) {
      // Priorizar um carrinho que esteja 'em_andamento'
      const openCart = initialCarts.find((c) => c.status === "em_andamento");
      activeId = openCart ? openCart.id : initialCarts[0].id;
    } else {
      // Criar o primeiro carrinho com data e hora padrão
      const defaultName = generateDefaultCartName();
      const firstCart: MercadoCarrinho = {
        id: generateUUID(),
        userId: user?.id || null,
        nome: defaultName,
        status: "em_andamento",
        totalEstimado: 0,
        totalFinal: null,
        fotoCupom: null,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        finalizadoEm: null,
        itens: [],
        syncStatus: "local_only",
      };
      initialCarts = [firstCart];
      activeId = firstCart.id;
      await saveCarrinhosToStorage(initialCarts);
    }

    set({
      carrinhos: initialCarts,
      carrinhoAtivoId: activeId,
      user,
      isInitialized: true,
    });

    // Se usuário estiver autenticado, disparar sincronização em background
    if (user) {
      get().syncNow();
    }
  },

  createCart: (customName?: string) => {
    const nome = customName?.trim() || generateDefaultCartName();
    const newCart: MercadoCarrinho = {
      id: generateUUID(),
      userId: get().user?.id || null,
      nome,
      status: "em_andamento",
      totalEstimado: 0,
      totalFinal: null,
      fotoCupom: null,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      finalizadoEm: null,
      itens: [],
      syncStatus: "local_only",
    };

    const updatedCarts = [newCart, ...get().carrinhos];
    set({
      carrinhos: updatedCarts,
      carrinhoAtivoId: newCart.id,
    });

    saveCarrinhosToStorage(updatedCarts);
    if (get().user) {
      get().syncNow();
    }

    return newCart;
  },

  setActiveCart: (id: string) => {
    set({ carrinhoAtivoId: id });
  },

  getActiveCart: () => {
    const { carrinhos, carrinhoAtivoId } = get();
    if (!carrinhoAtivoId) return carrinhos[0] || null;
    return carrinhos.find((c) => c.id === carrinhoAtivoId) || carrinhos[0] || null;
  },

  renameCart: (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const updated = get().carrinhos.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          nome: trimmed,
          atualizadoEm: new Date().toISOString(),
          syncStatus: "local_only" as StatusSincronizacao,
        };
      }
      return c;
    });

    set({ carrinhos: updated });
    saveCarrinhosToStorage(updated);
  },

  deleteCart: (id: string) => {
    const remaining = get().carrinhos.filter((c) => c.id !== id);

    let nextActiveId = get().carrinhoAtivoId;
    if (nextActiveId === id) {
      nextActiveId = remaining.length > 0 ? remaining[0].id : null;
    }

    // Se apagou todos, criar um novo
    if (remaining.length === 0) {
      const fresh = get().createCart();
      return;
    }

    set({
      carrinhos: remaining,
      carrinhoAtivoId: nextActiveId,
    });
    saveCarrinhosToStorage(remaining);
  },

  addItem: (carrinhoId: string, payload: CreateItemPayload) => {
    const precoUnitario = Number(payload.precoUnitario) || 0;
    const quantidade = Number(payload.quantidade) > 0 ? Number(payload.quantidade) : 1;
    const precoTotal = Number((precoUnitario * quantidade).toFixed(2));

    const newItem: MercadoItem = {
      id: generateUUID(),
      carrinhoId,
      nome: payload.nome.trim() || "Item sem nome",
      quantidade,
      precoUnitario,
      precoTotal,
      fotoProduto: payload.fotoProduto,
      ordem: 0,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    const updatedCarts = get().carrinhos.map((cart) => {
      if (cart.id === carrinhoId) {
        const nextItens = [newItem, ...cart.itens].map((it, idx) => ({ ...it, ordem: idx }));
        const nextTotal = nextItens.reduce((sum, it) => sum + it.precoTotal, 0);

        return {
          ...cart,
          itens: nextItens,
          totalEstimado: Number(nextTotal.toFixed(2)),
          atualizadoEm: new Date().toISOString(),
          syncStatus: "local_only" as StatusSincronizacao,
        };
      }
      return cart;
    });

    set({ carrinhos: updatedCarts });
    saveCarrinhosToStorage(updatedCarts);

    return newItem;
  },

  updateItemQuantity: (
    carrinhoId: string,
    itemId: string,
    change: number,
    isAbsolute = false
  ) => {
    const updatedCarts = get().carrinhos.map((cart) => {
      if (cart.id === carrinhoId) {
        const nextItens = cart.itens.map((item) => {
          if (item.id === itemId) {
            const newQty = isAbsolute
              ? Math.max(1, Math.round(change))
              : Math.max(1, Math.round(item.quantidade + change));
            const newTotal = Number((newQty * item.precoUnitario).toFixed(2));
            return {
              ...item,
              quantidade: newQty,
              precoTotal: newTotal,
              atualizadoEm: new Date().toISOString(),
            };
          }
          return item;
        });

        const nextCartTotal = nextItens.reduce((sum, it) => sum + it.precoTotal, 0);

        return {
          ...cart,
          itens: nextItens,
          totalEstimado: Number(nextCartTotal.toFixed(2)),
          atualizadoEm: new Date().toISOString(),
          syncStatus: "local_only" as StatusSincronizacao,
        };
      }
      return cart;
    });

    set({ carrinhos: updatedCarts });
    saveCarrinhosToStorage(updatedCarts);
  },

  updateItem: (carrinhoId: string, itemId: string, payload: UpdateItemPayload) => {
    const updatedCarts = get().carrinhos.map((cart) => {
      if (cart.id === carrinhoId) {
        const nextItens = cart.itens.map((item) => {
          if (item.id === itemId) {
            const nextNome = payload.nome !== undefined ? payload.nome.trim() : item.nome;
            const nextQty =
              payload.quantidade !== undefined && payload.quantidade > 0
                ? payload.quantidade
                : item.quantidade;
            const nextPreco =
              payload.precoUnitario !== undefined
                ? Number(payload.precoUnitario)
                : item.precoUnitario;
            const nextTotal = Number((nextQty * nextPreco).toFixed(2));
            const nextFoto =
              payload.fotoProduto !== undefined ? payload.fotoProduto : item.fotoProduto;

            return {
              ...item,
              nome: nextNome || item.nome,
              quantidade: nextQty,
              precoUnitario: nextPreco,
              precoTotal: nextTotal,
              fotoProduto: nextFoto,
              atualizadoEm: new Date().toISOString(),
            };
          }
          return item;
        });

        const nextCartTotal = nextItens.reduce((sum, it) => sum + it.precoTotal, 0);

        return {
          ...cart,
          itens: nextItens,
          totalEstimado: Number(nextCartTotal.toFixed(2)),
          atualizadoEm: new Date().toISOString(),
          syncStatus: "local_only" as StatusSincronizacao,
        };
      }
      return cart;
    });

    set({ carrinhos: updatedCarts });
    saveCarrinhosToStorage(updatedCarts);
  },

  deleteItem: (carrinhoId: string, itemId: string) => {
    const updatedCarts = get().carrinhos.map((cart) => {
      if (cart.id === carrinhoId) {
        const nextItens = cart.itens
          .filter((it) => it.id !== itemId)
          .map((it, idx) => ({ ...it, ordem: idx }));
        const nextCartTotal = nextItens.reduce((sum, it) => sum + it.precoTotal, 0);

        return {
          ...cart,
          itens: nextItens,
          totalEstimado: Number(nextCartTotal.toFixed(2)),
          atualizadoEm: new Date().toISOString(),
          syncStatus: "local_only" as StatusSincronizacao,
        };
      }
      return cart;
    });

    set({ carrinhos: updatedCarts });
    saveCarrinhosToStorage(updatedCarts);
  },

  finishCart: (carrinhoId: string, payload?: FinalizarCarrinhoPayload) => {
    const updatedCarts = get().carrinhos.map((cart) => {
      if (cart.id === carrinhoId) {
        const totalFinal =
          payload?.totalFinal !== undefined && payload.totalFinal !== null
            ? Number(payload.totalFinal)
            : cart.totalEstimado;

        return {
          ...cart,
          status: "finalizado" as const,
          totalFinal,
          fotoCupom: payload?.fotoCupom !== undefined ? payload.fotoCupom : cart.fotoCupom,
          finalizadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
          syncStatus: "local_only" as StatusSincronizacao,
        };
      }
      return cart;
    });

    set({ carrinhos: updatedCarts });
    saveCarrinhosToStorage(updatedCarts);

    if (get().user) {
      get().syncNow();
    }
  },

  reopenCart: (carrinhoId: string) => {
    const updatedCarts = get().carrinhos.map((cart) => {
      if (cart.id === carrinhoId) {
        return {
          ...cart,
          status: "em_andamento" as const,
          finalizadoEm: null,
          atualizadoEm: new Date().toISOString(),
          syncStatus: "local_only" as StatusSincronizacao,
        };
      }
      return cart;
    });

    set({
      carrinhos: updatedCarts,
      carrinhoAtivoId: carrinhoId,
    });
    saveCarrinhosToStorage(updatedCarts);
  },

  syncNow: async () => {
    const user = await checkAuthUser();
    if (!user) {
      set({
        user: null,
        syncError: null,
      });
      return;
    }

    set({ isSyncing: true, syncError: null });

    const result = await syncCartsWithSupabase(get().carrinhos);

    if (result.success) {
      set({
        carrinhos: result.carts,
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
        syncError: null,
        user,
      });
      await saveCarrinhosToStorage(result.carts);
    } else {
      set({
        isSyncing: false,
        syncError: result.error || "Falha na sincronização",
        user,
      });
    }
  },

  checkAuthStatus: async () => {
    const user = await checkAuthUser();
    set({ user });
  },
}));
