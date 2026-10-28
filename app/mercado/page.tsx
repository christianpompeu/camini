"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Plus,
  History,
  CheckCircle2,
  Receipt,
  Search,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMercadoStore } from "@/store/useMercadoStore";
import { formatBRL, formatDateTime } from "@/lib/mercado/utils";
import { CartItemCard } from "@/components/mercado/cart-item-card";
import { AddItemModal } from "@/components/mercado/add-item-modal";
import { FinishCartModal } from "@/components/mercado/finish-cart-modal";
import { CartHistoryDrawer } from "@/components/mercado/cart-history-drawer";
import { SyncStatusBar } from "@/components/mercado/sync-status-bar";
import { toast } from "sonner";

export default function MercadoPage() {
  const {
    carrinhos,
    carrinhoAtivoId,
    isInitialized,
    isSyncing,
    lastSyncTime,
    syncError,
    user,
    init,
    createCart,
    setActiveCart,
    getActiveCart,
    renameCart,
    deleteCart,
    addItem,
    updateItemQuantity,
    deleteItem,
    finishCart,
    reopenCart,
    syncNow,
  } = useMercadoStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Inicializar store cliente-side (IndexedDB + Auth)
  useEffect(() => {
    init();
  }, [init]);

  const activeCart = getActiveCart();

  // Itens filtrados por busca rápida
  const filteredItems = useMemo(() => {
    if (!activeCart) return [];
    if (!searchQuery.trim()) return activeCart.itens;
    const q = searchQuery.toLowerCase();
    return activeCart.itens.filter((it) => it.nome.toLowerCase().includes(q));
  }, [activeCart, searchQuery]);

  // Total de unidades de produtos
  const totalUnits = useMemo(() => {
    if (!activeCart) return 0;
    return activeCart.itens.reduce((sum, it) => sum + it.quantidade, 0);
  }, [activeCart]);

  if (!isInitialized || !activeCart) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center animate-pulse">
            <ShoppingCart className="size-6" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground animate-pulse">
            Carregando carrinho de mercado...
          </p>
        </main>
      </div>
    );
  }

  const isFinished = activeCart.status === "finalizado";
  const displayTotal = isFinished && activeCart.totalFinal ? activeCart.totalFinal : activeCart.totalEstimado;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* 1. Header Global do Camini Hub */}
      <Navbar />

      {/* 2. Sub-Header do Módulo Mercado */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-14 z-30 px-4 sm:px-6 py-2.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground p-1 -ml-1 rounded-lg transition-colors"
              title="Voltar ao início"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-foreground tracking-tight truncate">
                  {activeCart.nome}
                </span>
                {isFinished ? (
                  <Badge
                    variant="secondary"
                    className="text-[9px] uppercase font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shrink-0"
                  >
                    Finalizado
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[9px] uppercase font-bold text-primary border-primary/30 shrink-0"
                  >
                    Ativo
                  </Badge>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground truncate">
                Criado em {formatDateTime(activeCart.criadoEm)}
              </span>
            </div>
          </div>

          {/* Botões do Topo: Histórico & Novo Carrinho */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryOpen(true)}
              className="h-8 px-2.5 rounded-xl text-xs font-semibold gap-1.5 shadow-2xs"
              title="Ver histórico de compras"
            >
              <History className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Histórico</span>
              <span className="size-4 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                {carrinhos.length}
              </span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                const fresh = createCart();
                toast.success(`Novo carrinho criado: "${fresh.nome}"`);
              }}
              className="h-8 px-2.5 rounded-xl text-xs font-bold gap-1 bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90"
              title="Criar novo carrinho de compras"
            >
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">Novo</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 3. Conteúdo Principal Mobile-First */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 pb-32 space-y-4">
        {/* Barra de Status de Sincronização e Modo Offline */}
        <SyncStatusBar
          user={user}
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
          syncError={syncError}
          onSync={syncNow}
        />

        {/* Card Hero de Totais em Tempo Real */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/30 p-5 sm:p-6 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShoppingCart className="size-3.5 text-primary" />
                {isFinished ? "Valor Final da Compra" : "Total Estimado no Carrinho"}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {formatBRL(displayTotal)}
              </div>
            </div>

            {/* Badge de Itens e Unidades */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="text-right">
                <span className="text-xs font-semibold text-muted-foreground block">
                  {activeCart.itens.length} {activeCart.itens.length === 1 ? "produto" : "produtos"}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {totalUnits} {totalUnits === 1 ? "unidade" : "unidades"}
                </span>
              </div>
              {!isFinished && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Atualiza sozinho
                </span>
              )}
            </div>
          </div>

          {/* Rodapé do Card: Ações do Carrinho */}
          <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            {isFinished ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="size-4" />
                  <span>Compra Concluída no Caixa</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    reopenCart(activeCart.id);
                    toast.info("Carrinho reaberto para edição.");
                  }}
                  className="h-8 rounded-xl text-xs gap-1.5"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reabrir Carrinho</span>
                </Button>
              </div>
            ) : (
              <>
                <span className="text-muted-foreground text-[11px]">
                  Adicione os itens conforme for colocando dentro do carrinho.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFinishModalOpen(true)}
                  className="h-8 rounded-xl text-xs font-semibold gap-1.5 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10 ml-auto"
                >
                  <Receipt className="size-3.5" />
                  <span>Finalizar no Caixa</span>
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Barra de Ação Rápida: Adicionar Produto & Busca */}
        {!isFinished && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 h-12 rounded-2xl font-bold text-sm gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              <Plus className="size-5" />
              <span>Adicionar Produto</span>
            </Button>

            {activeCart.itens.length > 3 && (
              <div className="relative w-36 sm:w-48 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-input bg-card pl-9 pr-3 text-xs font-medium text-foreground outline-none focus:border-primary"
                />
              </div>
            )}
          </div>
        )}

        {/* Lista de Itens no Carrinho */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Itens no Carrinho ({filteredItems.length})
            </h3>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Limpar filtro
              </button>
            )}
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 p-8 text-center space-y-3">
              <div className="size-14 mx-auto rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground/60">
                <ShoppingBag className="size-7" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="font-bold text-sm text-foreground">
                  {searchQuery ? "Nenhum produto com esse nome" : "Seu carrinho está vazio"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {searchQuery
                    ? "Tente buscar por outro termo ou limpe o filtro."
                    : "Conforme for caminhando pelos corredores do supermercado, toque em '+ Adicionar Produto' para ir somando os valores."}
                </p>
              </div>
              {!isFinished && !searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(true)}
                  className="h-10 rounded-xl text-xs font-bold gap-2 mt-2"
                >
                  <Plus className="size-4 text-primary" />
                  <span>Registrar Primeiro Item</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredItems.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  isReadOnly={isFinished}
                  onUpdateQuantity={(newQty) =>
                    updateItemQuantity(activeCart.id, item.id, newQty, true)
                  }
                  onDeleteItem={() => {
                    deleteItem(activeCart.id, item.id);
                    toast.info(`"${item.nome}" removido do carrinho.`);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 4. Barra Fixa Inferior de Ação Mobile (quando houver itens) */}
      {!isFinished && activeCart.itens.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border px-4 py-3 shadow-lg">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Total Atual ({totalUnits} un.)
              </span>
              <span className="text-xl font-extrabold text-foreground tracking-tight">
                {formatBRL(activeCart.totalEstimado)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="h-11 px-4 rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <Plus className="size-4" />
                <span>+ Produto</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFinishModalOpen(true)}
                className="h-11 px-3.5 rounded-xl text-xs font-bold gap-1.5 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/15"
              >
                <Receipt className="size-4" />
                <span>Finalizar</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modais do Fluxo de Carrinho */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={(payload) => {
          addItem(activeCart.id, payload);
          toast.success(`"${payload.nome}" adicionado.`);
        }}
      />

      <FinishCartModal
        carrinho={activeCart}
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        onConfirmFinish={({ totalFinal, fotoCupom }) => {
          finishCart(activeCart.id, { totalFinal, fotoCupom });
          toast.success("Compra finalizada e arquivada com sucesso!");
        }}
      />

      <CartHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        carrinhos={carrinhos}
        carrinhoAtivoId={carrinhoAtivoId}
        onSelectCart={(id) => {
          setActiveCart(id);
          setSearchQuery("");
        }}
        onCreateCart={(customName) => {
          createCart(customName);
          setSearchQuery("");
        }}
        onRenameCart={renameCart}
        onDeleteCart={deleteCart}
      />
    </div>
  );
}
