/**
 * CAMINI MERCADO — Tipagens para Carrinho de Compras Offline-First
 */

export type StatusCarrinho = "em_andamento" | "finalizado" | "cancelado";

export type StatusSincronizacao = "local_only" | "syncing" | "synced" | "error";

export interface MercadoItem {
  id: string;
  carrinhoId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number; // Em centavos ou valor float em reais (ex: 12.50)
  precoTotal: number;    // quantidade * precoUnitario
  fotoProduto?: string;  // Base64 ou URL da imagem
  ordem: number;
  criadoEm: string;      // ISO string
  atualizadoEm: string;  // ISO string
}

export interface MercadoCarrinho {
  id: string;
  userId?: string | null;
  nome: string;
  status: StatusCarrinho;
  totalEstimado: number;
  totalFinal?: number | null;
  fotoCupom?: string | null; // Foto do cupom fiscal tirada no caixa
  criadoEm: string;          // ISO string
  atualizadoEm: string;      // ISO string
  finalizadoEm?: string | null;
  itens: MercadoItem[];
  syncStatus?: StatusSincronizacao;
  syncError?: string | null;
}

export interface CreateItemPayload {
  nome: string;
  quantidade: number;
  precoUnitario: number;
  fotoProduto?: string;
}

export interface UpdateItemPayload {
  nome?: string;
  quantidade?: number;
  precoUnitario?: number;
  fotoProduto?: string;
}

export interface FinalizarCarrinhoPayload {
  totalFinal?: number;
  fotoCupom?: string;
}
