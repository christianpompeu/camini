"use client";

import React from "react";
import {
  Bot,
  User,
  Sparkles,
  Lightbulb,
  Table as TableIcon,
  Database,
  ArrowUpRight,
} from "lucide-react";
import { ChatMessage } from "@/lib/totvs-rm/types";
import { SqlCodeBlock } from "./sql-code-block";
import { Card, CardContent } from "@/components/ui/card";

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
  if (messages.length === 0) {
    const suggestions = [
      {
        modulo: "RM Fluxus (Financeiro)",
        prompt: "Lançamentos financeiros a pagar em aberto com fornecedor e vencimento",
      },
      {
        modulo: "RM Nucleus (Compras & Estoque)",
        prompt: "Movimentos de compras com itens, produtos, quantidade e fornecedor",
      },
      {
        modulo: "RM Labore (Folha / RH)",
        prompt: "Funcionários ativos admitidos nos últimos 12 meses com cargo e salário",
      },
      {
        modulo: "RM Saldus (Contábil)",
        prompt: "Partidas contábeis do exercício com conta a débito e a crédito",
      },
    ];

    return (
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex flex-col justify-center items-center">
        <div className="w-full max-w-2xl mx-auto space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Database className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Gerador de Consultas RM SQL
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Descreva a informação que você precisa extrair do TOTVS Corpore RM.
              A inteligência artificial irá formular a query SQL correspondente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-left">
            {suggestions.map((item, idx) => (
              <Card 
                key={idx} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => onSelectPromptSuggestion(item.prompt)}
              >
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-muted-foreground">{item.modulo}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium leading-snug">
                    &quot;{item.prompt}&quot;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
      {messages.map((msg) => {
        const isUser = msg.role === "user";

        return (
          <div
            key={msg.id}
            className={`flex gap-4 max-w-4xl mx-auto ${
              isUser ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm ${isUser ? "bg-background" : "bg-primary text-primary-foreground"}`}>
              {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div className={`flex w-full flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
              <div
                className={`rounded-xl px-4 py-3 text-sm max-w-[85%] ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted border border-border"
                }`}
              >
                {/* Tabelas Usadas */}
                {!isUser && msg.tablesUsed && msg.tablesUsed.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-3 pb-2 border-b border-border/50">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <TableIcon className="h-3 w-3" />
                      Tabelas:
                    </span>
                    {msg.tablesUsed.map((tbl) => (
                      <button
                        key={tbl}
                        onClick={() => onInspectTable(tbl)}
                        className="px-2 py-0.5 rounded-md bg-background/50 hover:bg-background border border-border text-xs font-mono transition-colors"
                        title={`Explorar tabela ${tbl}`}
                      >
                        {tbl}
                      </button>
                    ))}
                  </div>
                )}

                {msg.sqlExplanation ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {msg.sqlExplanation.split("\n\n").map((par, i) => (
                      <p key={i} className="mb-2 last:mb-0">
                        {par}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>

              {!isUser && msg.sqlCode && (
                <div className="w-full mt-2">
                  <SqlCodeBlock code={msg.sqlCode} />
                </div>
              )}

              {!isUser && msg.tips && msg.tips.length > 0 && (
                <div className="mt-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-900 dark:text-amber-200 w-full">
                  <div className="flex items-center gap-2 font-semibold mb-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>Dicas & Regras do RM</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {msg.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex gap-4 max-w-4xl mx-auto">
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div className="rounded-xl px-4 py-3 text-sm max-w-[85%] bg-muted border border-border flex items-center gap-2">
            <Sparkles className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Gerando consulta...</span>
          </div>
        </div>
      )}
    </div>
  );
}
