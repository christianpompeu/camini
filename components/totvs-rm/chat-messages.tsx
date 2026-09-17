"use client";

import React from "react";
import {
  Bot,
  User,
  Sparkles,
  Lightbulb,
  Table as TableIcon,
  ArrowUpRight,
  Database,
  Coins,
  Package,
  Users,
  Calculator,
} from "lucide-react";
import { ChatMessage } from "@/lib/totvs-rm/types";
import { SqlCodeBlock } from "./sql-code-block";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onInspectTable: (tableName: string) => void;
  onSelectPromptSuggestion: (prompt: string) => void;
}

export function ChatMessages({
  messages,
  isLoading,
  onInspectTable,
  onSelectPromptSuggestion,
}: ChatMessagesProps) {
  // Estado Inicial: Sugestões Prontas para o ERP TOTVS RM
  if (messages.length === 0) {
    const suggestions = [
      {
        modulo: "RM Fluxus (Financeiro)",
        icon: Coins,
        color: "text-energy-amber",
        prompt: "Lançamentos financeiros a pagar em aberto com fornecedor e vencimento",
      },
      {
        modulo: "RM Nucleus (Compras & Estoque)",
        icon: Package,
        color: "text-energy-blue",
        prompt: "Movimentos de compras com itens, produtos, quantidade e fornecedor",
      },
      {
        modulo: "RM Labore (Folha / RH)",
        icon: Users,
        color: "text-energy-green",
        prompt: "Funcionários ativos admitidos nos últimos 12 meses com cargo e salário",
      },
      {
        modulo: "RM Saldus (Contábil)",
        icon: Calculator,
        color: "text-energy-violet",
        prompt: "Partidas contábeis do exercício com conta a débito e a crédito",
      },
    ];

    return (
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex flex-col justify-center items-center scrollbar-thin">
        <div className="w-full max-w-2xl my-auto space-y-4 py-2 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-energy flex items-center justify-center text-white shadow-lg shadow-energy-blue/20 animate-in zoom-in duration-300">
            <Database className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
              Escreva consultas SQL para o <span className="text-gradient-energy">TOTVS RM</span>
            </h2>
            <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
              Catálogo de mais de 9.400 tabelas, colunas, chaves estrangeiras e relacionamentos.
            </p>
          </div>

          {/* Grade de Sugestões Compacta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left pt-1">
            {suggestions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectPromptSuggestion(item.prompt)}
                  className="group p-3 rounded-xl border border-outline bg-surface-elevated hover:border-energy-blue/50 hover:shadow-md transition-all text-xs flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span className="font-bold text-[11px] text-text-primary">{item.modulo}</span>
                    </div>
                    <ArrowUpRight className="w-3 h-3 text-text-secondary group-hover:text-energy-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-text-secondary leading-snug line-clamp-2 text-[11px]">
                    &ldquo;{item.prompt}&rdquo;
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
      {messages.map((msg) => {
        const isUser = msg.role === "user";

        return (
          <div
            key={msg.id}
            className={`flex gap-3 sm:gap-4 max-w-4xl ${
              isUser ? "ml-auto justify-end" : "mr-auto justify-start"
            }`}
          >
            {/* Ícone de Avatar Assistente */}
            {!isUser && (
              <div className="w-8 h-8 rounded-lg bg-gradient-energy flex items-center justify-center text-white shrink-0 shadow-md shadow-energy-blue/20 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            {/* Conteúdo da Mensagem */}
            <div
              className={`space-y-3 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm ${
                isUser
                  ? "bg-gradient-energy text-white font-medium shadow-md shadow-energy-blue/15 max-w-[85%] sm:max-w-xl rounded-tr-none"
                  : "bg-surface-elevated border border-outline text-text-primary shadow-sm w-full rounded-tl-none"
              }`}
            >
              {/* Badges de Tabelas RM Usadas */}
              {!isUser && msg.tablesUsed && msg.tablesUsed.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-outline/50">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1 mr-1">
                    <TableIcon className="w-3 h-3 text-energy-blue" />
                    Tabelas RM:
                  </span>
                  {msg.tablesUsed.map((tbl) => (
                    <button
                      key={tbl}
                      onClick={() => onInspectTable(tbl)}
                      className="px-2 py-0.5 rounded-pill bg-energy-blue/15 hover:bg-energy-blue/25 text-energy-blue font-mono font-bold text-[11px] transition-colors border border-energy-blue/20"
                      title={`Ver campos e regras da tabela ${tbl}`}
                    >
                      {tbl}
                    </button>
                  ))}
                </div>
              )}

              {/* Explicação da Consulta em Markdown simples */}
              {msg.sqlExplanation ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-text-primary space-y-2">
                  {msg.sqlExplanation.split("\n\n").map((par, i) => (
                    <p key={i} className="leading-relaxed">
                      {par}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              )}

              {/* Bloco de Código SQL Formatado */}
              {!isUser && msg.sqlCode && (
                <SqlCodeBlock code={msg.sqlCode} />
              )}

              {/* Dicas e Boas Práticas do TOTVS RM */}
              {!isUser && msg.tips && msg.tips.length > 0 && (
                <div className="p-3.5 rounded-xl bg-energy-amber/10 border border-energy-amber/30 text-text-primary space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-energy-amber text-[11px]">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                    <span>Boas Práticas & Regras TOTVS RM</span>
                  </div>
                  <ul className="space-y-1 list-disc list-inside text-text-secondary text-[11px]">
                    {msg.tips.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Ícone de Avatar Usuário */}
            {isUser && (
              <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-outline flex items-center justify-center text-text-primary shrink-0 shadow-sm mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        );
      })}

      {/* Indicador de Carregamento */}
      {isLoading && (
        <div className="flex gap-3 sm:gap-4 mr-auto max-w-2xl animate-pulse">
          <div className="w-8 h-8 rounded-lg bg-gradient-energy flex items-center justify-center text-white shrink-0 shadow-md">
            <Bot className="w-4 h-4" />
          </div>
          <div className="p-4 rounded-2xl rounded-tl-none bg-surface-elevated border border-outline text-xs text-text-secondary flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-energy-blue animate-spin" />
            <span>Consultando dicionário de dados RM e gerando consulta SQL...</span>
          </div>
        </div>
      )}
    </div>
  );
}
