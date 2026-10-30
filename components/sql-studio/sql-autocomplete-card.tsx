"use client";

import React, { useEffect, useRef } from "react";
import { Key, Binary, Link2, Columns2, Sparkles, CornerDownLeft } from "lucide-react";
import type { RMSemanticColumn } from "../../lib/totvs-rm/types.ts";
import type { JoinOpportunity } from "../../lib/totvs-rm/query-parser.ts";

export type AutocompleteTriggerType = "column" | "join";

export interface ColumnSuggestionItem {
  tableName: string;
  alias: string;
  column: RMSemanticColumn;
}

export interface SqlAutocompleteCardProps {
  type: AutocompleteTriggerType;
  position: { top: number; left: number };
  containerBounds?: { width: number; height: number };
  // Itens para Colunas
  columnItems?: ColumnSuggestionItem[];
  tableLabel?: string;
  // Itens para JOINs
  joinItems?: JoinOpportunity[];
  // Índice selecionado
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onApplyColumn: (item: ColumnSuggestionItem) => void;
  onApplyJoin: (item: JoinOpportunity) => void;
  onClose: () => void;
}

export const SqlAutocompleteCard: React.FC<SqlAutocompleteCardProps> = ({
  type,
  position,
  containerBounds = { width: 800, height: 600 },
  columnItems = [],
  tableLabel = "",
  joinItems = [],
  selectedIndex,
  onSelectIndex,
  onApplyColumn,
  onApplyJoin,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const totalItems = type === "column" ? columnItems.length : joinItems.length;

  // Auto-scroll para manter o item selecionado visível na rolagem
  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
    if (selectedElement) {
      const containerTop = listRef.current.scrollTop;
      const containerBottom = containerTop + listRef.current.clientHeight;
      const elementTop = selectedElement.offsetTop;
      const elementBottom = elementTop + selectedElement.clientHeight;

      if (elementTop < containerTop) {
        listRef.current.scrollTop = elementTop;
      } else if (elementBottom > containerBottom) {
        listRef.current.scrollTop = elementBottom - listRef.current.clientHeight;
      }
    }
  }, [selectedIndex]);

  if (totalItems === 0) {
    return null;
  }

  // Ajuste de colisão de bordas para evitar que o card saia do container
  const CARD_WIDTH = type === "column" ? 340 : 420;
  const CARD_MAX_HEIGHT = 260;

  // Se estiver muito embaixo, abre para cima do caret
  const openUpwards = position.top + CARD_MAX_HEIGHT > containerBounds.height - 30;
  const finalTop = openUpwards
    ? Math.max(10, position.top - CARD_MAX_HEIGHT - 6)
    : Math.min(position.top + 6, containerBounds.height - CARD_MAX_HEIGHT - 10);

  // Se estiver muito à direita, puxa para a esquerda
  const finalLeft = Math.min(
    Math.max(10, position.left),
    Math.max(10, containerBounds.width - CARD_WIDTH - 20)
  );

  return (
    <div
      ref={cardRef}
      style={{
        top: `${finalTop}px`,
        left: `${finalLeft}px`,
        width: `${CARD_WIDTH}px`,
      }}
      className="absolute z-50 rounded-xl border border-border/80 bg-popover/95 text-popover-foreground shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col font-sans select-none text-xs"
    >
      {/* Cabeçalho do Card com Contexto Ativo */}
      <div className="px-3 py-1.5 border-b border-border bg-muted/40 flex items-center justify-between text-[11px] text-muted-foreground shrink-0">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          {type === "column" ? (
            <>
              <Columns2 className="h-3.5 w-3.5 text-primary" />
              <span>Colunas de</span>
              <span className="font-mono text-primary font-bold">{tableLabel}</span>
            </>
          ) : (
            <>
              <Link2 className="h-3.5 w-3.5 text-primary" />
              <span>Sugestões de JOIN (Grafo Semântico)</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] bg-background/80 px-1.5 py-0.5 rounded border border-border/60">
          <span className="font-mono font-medium text-foreground">{selectedIndex + 1}</span>
          <span>/</span>
          <span>{totalItems}</span>
        </div>
      </div>

      {/* Lista Rolável de Sugestões */}
      <div
        ref={listRef}
        className="max-h-[220px] overflow-y-auto p-1 divide-y divide-border/20"
      >
        {type === "column" &&
          columnItems.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const isPk =
              item.column.nome.startsWith("COD") ||
              item.column.nome.startsWith("ID") ||
              item.column.nome === "CHAPA";

            return (
              <div
                key={item.column.nome}
                onMouseEnter={() => onSelectIndex(idx)}
                onClick={() => onApplyColumn(item)}
                className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-medium shadow-2xs"
                    : "hover:bg-muted/60 text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isPk ? (
                    <Key
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isSelected ? "text-amber-200" : "text-amber-500"
                      }`}
                    />
                  ) : (
                    <Binary
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-semibold truncate">
                        {item.column.nome}
                      </span>
                    </div>
                    {item.column.descricao && (
                      <p
                        className={`text-[10px] truncate ${
                          isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                        }`}
                      >
                        {item.column.descricao}
                      </p>
                    )}
                  </div>
                </div>

                {item.column.tipo && (
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0 border ${
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                        : "bg-muted text-muted-foreground border-border/40"
                    }`}
                  >
                    {item.column.tipo}
                  </span>
                )}
              </div>
            );
          })}

        {type === "join" &&
          joinItems.map((opp, idx) => {
            const isSelected = idx === selectedIndex;

            return (
              <div
                key={`${opp.baseTable}-${opp.targetTable}-${idx}`}
                onMouseEnter={() => onSelectIndex(idx)}
                onClick={() => onApplyJoin(opp)}
                className={`px-2.5 py-2 rounded-lg flex flex-col gap-1 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "hover:bg-muted/60 text-foreground"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold font-mono px-1 py-0.2 rounded uppercase ${
                        isSelected
                          ? "bg-primary-foreground/25 text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {opp.joinType}
                    </span>
                    <span className="font-mono font-bold text-xs">
                      {opp.targetTable}
                    </span>
                    <span
                      className={`text-[10px] ${
                        isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                      }`}
                    >
                      (via {opp.baseTable})
                    </span>
                  </div>

                  <CornerDownLeft
                    className={`h-3 w-3 shrink-0 ${
                      isSelected ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  />
                </div>

                {opp.targetDescription && (
                  <p
                    className={`text-[11px] truncate ${
                      isSelected ? "text-primary-foreground/90" : "text-muted-foreground"
                    }`}
                  >
                    {opp.targetDescription}
                  </p>
                )}

                <div
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded truncate ${
                    isSelected
                      ? "bg-black/20 text-primary-foreground/90"
                      : "bg-muted/80 text-muted-foreground border border-border/40"
                  }`}
                  title={opp.chavesLigacao}
                >
                  ON {opp.chavesLigacao}
                </div>
              </div>
            );
          })}
      </div>

      {/* Rodapé com Atalhos de Teclado */}
      <div className="px-3 py-1 border-t border-border bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground shrink-0">
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.2 bg-background border border-border rounded font-mono">↑↓</kbd>
          <span>navegar</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.2 bg-background border border-border rounded font-mono">Tab / ↵</kbd>
          <span>aplicar</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.2 bg-background border border-border rounded font-mono">Esc</kbd>
          <span>fechar</span>
        </span>
      </div>
    </div>
  );
};
