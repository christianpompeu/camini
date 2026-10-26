"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Columns2,
  ArrowRight,
  ArrowDownLeft,
  Key,
  Copy,
  Check,
  X,
  Share2,
} from "lucide-react";
import {
  RMSemanticTableWithKey,
} from "@/lib/totvs-rm/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RM_MODULES_CONFIG } from "./types";

interface TableRelationGraphProps {
  rootTable: RMSemanticTableWithKey;
  onSelectTable?: (tableName: string) => void;
  onOpenSideBySide?: (tableName: string) => void;
  activeSecondaryTable?: string | null;
  className?: string;
  compact?: boolean;
}

interface GraphNode {
  id: string;
  tableName: string;
  direction: "root" | "outgoing" | "incoming";
  chaves: string;
  modulePrefix: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  direction: "outgoing" | "incoming";
  chaves: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function TableRelationGraph({
  rootTable,
  onSelectTable,
  onOpenSideBySide,
  activeSecondaryTable,
  className = "",
  compact = false,
}: TableRelationGraphProps) {
  const [filterDirection, setFilterDirection] = useState<"all" | "outgoing" | "incoming">("all");
  const [filterTerm, setFilterTerm] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Estados de Pan e Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Resetar visualização
  const handleResetView = useCallback(() => {
    setZoom(compact ? 0.85 : 1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId(null);
  }, [compact]);

  // Redefinir quando mudar a tabela raiz
  useEffect(() => {
    handleResetView();
  }, [rootTable.tabela, handleResetView]);

  // Colunas de chave primária da tabela raiz
  const rootKeyColumns = useMemo(() => {
    return (rootTable.colunas || [])
      .filter(
        (c) =>
          c.nome.startsWith("COD") ||
          c.nome.startsWith("ID") ||
          c.nome === "CHAPA" ||
          c.nome === "NSEQITMMOV"
      )
      .slice(0, 6);
  }, [rootTable.colunas]);

  // Filtragem de relacionamentos
  const outgoingList = useMemo(() => {
    const list = rootTable.relacionamentos_saida || [];
    if (!filterTerm) return list;
    const q = filterTerm.toUpperCase();
    return list.filter(
      (r) => r.tabela_destino.toUpperCase().includes(q) || r.chaves_ligacao.toUpperCase().includes(q)
    );
  }, [rootTable.relacionamentos_saida, filterTerm]);

  const incomingList = useMemo(() => {
    const list = rootTable.relacionamentos_entrada || [];
    if (!filterTerm) return list;
    const q = filterTerm.toUpperCase();
    return list.filter(
      (r) => r.tabela_origem.toUpperCase().includes(q) || r.chaves_ligacao.toUpperCase().includes(q)
    );
  }, [rootTable.relacionamentos_entrada, filterTerm]);

  // Cálculo das posições dos nós e arestas no layout do Grafo
  const { nodes, edges } = useMemo(() => {
    const calculatedNodes: GraphNode[] = [];
    const calculatedEdges: GraphEdge[] = [];

    const rootWidth = 240;
    const rootHeight = 140 + rootKeyColumns.length * 18;
    const rootX = 0;
    const rootY = 0;

    // 1. Nó Raiz (Central)
    calculatedNodes.push({
      id: rootTable.tabela,
      tableName: rootTable.tabela,
      direction: "root",
      chaves: "",
      modulePrefix: rootTable.tabela.charAt(0),
      x: rootX,
      y: rootY,
      width: rootWidth,
      height: rootHeight,
    });

    const nodeWidth = 210;
    const nodeHeight = 64;
    const verticalGap = 16;
    const horizontalDistance = compact ? 280 : 340;

    // 2. Nós de Saída (Outgoing FKs - posicionados à direita)
    if (filterDirection === "all" || filterDirection === "outgoing") {
      const totalOut = outgoingList.length;
      const totalOutHeight = totalOut * (nodeHeight + verticalGap) - verticalGap;
      const startOutY = rootY + rootHeight / 2 - totalOutHeight / 2;

      outgoingList.forEach((rel, idx) => {
        const nodeX = rootX + rootWidth + horizontalDistance;
        const nodeY = startOutY + idx * (nodeHeight + verticalGap);
        const nodeId = `out_${rel.tabela_destino}_${idx}`;

        calculatedNodes.push({
          id: nodeId,
          tableName: rel.tabela_destino,
          direction: "outgoing",
          chaves: rel.chaves_ligacao,
          modulePrefix: rel.tabela_destino.charAt(0),
          x: nodeX,
          y: nodeY,
          width: nodeWidth,
          height: nodeHeight,
        });

        calculatedEdges.push({
          id: `edge_${nodeId}`,
          sourceId: rootTable.tabela,
          targetId: nodeId,
          direction: "outgoing",
          chaves: rel.chaves_ligacao,
          startX: rootX + rootWidth,
          startY: rootY + rootHeight / 2,
          endX: nodeX,
          endY: nodeY + nodeHeight / 2,
        });
      });
    }

    // 3. Nós de Entrada (Incoming FKs - posicionados à esquerda)
    if (filterDirection === "all" || filterDirection === "incoming") {
      const totalIn = incomingList.length;
      const totalInHeight = totalIn * (nodeHeight + verticalGap) - verticalGap;
      const startInY = rootY + rootHeight / 2 - totalInHeight / 2;

      incomingList.forEach((rel, idx) => {
        const nodeX = rootX - horizontalDistance - nodeWidth;
        const nodeY = startInY + idx * (nodeHeight + verticalGap);
        const nodeId = `in_${rel.tabela_origem}_${idx}`;

        calculatedNodes.push({
          id: nodeId,
          tableName: rel.tabela_origem,
          direction: "incoming",
          chaves: rel.chaves_ligacao,
          modulePrefix: rel.tabela_origem.charAt(0),
          x: nodeX,
          y: nodeY,
          width: nodeWidth,
          height: nodeHeight,
        });

        calculatedEdges.push({
          id: `edge_${nodeId}`,
          sourceId: nodeId,
          targetId: rootTable.tabela,
          direction: "incoming",
          chaves: rel.chaves_ligacao,
          startX: nodeX + nodeWidth,
          startY: nodeY + nodeHeight / 2,
          endX: rootX,
          endY: rootY + rootHeight / 2,
        });
      });
    }

    return {
      nodes: calculatedNodes,
      edges: calculatedEdges,
    };
  }, [
    rootTable,
    rootKeyColumns,
    outgoingList,
    incomingList,
    filterDirection,
    compact,
  ]);

  // Manipuladores de mouse para Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".no-pan")) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom pelo mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 2.2));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Obter detalhes do nó selecionado
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, nodes]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col w-full h-full min-h-0 bg-background overflow-hidden select-none border-border ${className}`}
    >
      {/* 1. Barra de Controles e Filtros do Grafo */}
      <div className="p-3 border-b border-border bg-muted/20 flex flex-wrap items-center justify-between gap-2 shrink-0 z-20">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
            <Share2 className="h-4 w-4 text-primary" />
            <span>Grafo de Relacionamentos:</span>
            <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              {rootTable.tabela}
            </span>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Filtro de Direção */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border text-[11px]">
            <button
              onClick={() => setFilterDirection("all")}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                filterDirection === "all"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todas ({(rootTable.relacionamentos_saida?.length || 0) + (rootTable.relacionamentos_entrada?.length || 0)})
            </button>
            <button
              onClick={() => setFilterDirection("outgoing")}
              className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${
                filterDirection === "outgoing"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowRight className="h-3 w-3 text-primary" />
              <span>Saída ({rootTable.relacionamentos_saida?.length || 0})</span>
            </button>
            <button
              onClick={() => setFilterDirection("incoming")}
              className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${
                filterDirection === "incoming"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowDownLeft className="h-3 w-3 text-indigo-500" />
              <span>Entrada ({rootTable.relacionamentos_entrada?.length || 0})</span>
            </button>
          </div>
        </div>

        {/* Busca rápida no grafo & Zoom */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filtrar tabela no grafo..."
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="pl-7 h-7 text-xs font-mono w-36 sm:w-44 bg-background"
            />
            {filterTerm && (
              <button
                onClick={() => setFilterTerm("")}
                className="absolute right-1.5 top-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
              title="Aumentar zoom"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
              title="Diminuir zoom"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={handleResetView}
              title="Centralizar e redefinir zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Área do Canvas Interativo SVG com Pan e Zoom */}
      <div
        className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden bg-dot-pattern"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          className="w-full h-full absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <defs>
            {/* Marcador de seta para Saída */}
            <marker
              id="arrow-out"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-primary, #3b82f6)" />
            </marker>

            {/* Marcador de seta para Entrada */}
            <marker
              id="arrow-in"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
            </marker>

            {/* Gradiente de conexão */}
            <linearGradient id="grad-out" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary, #3b82f6)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--color-primary, #3b82f6)" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="grad-in" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Renderização das Arestas Curvas Bézier */}
          <g>
            {edges.map((edge) => {
              const isOut = edge.direction === "outgoing";
              const strokeColor = isOut ? "url(#grad-out)" : "url(#grad-in)";
              const markerEnd = isOut ? "url(#arrow-out)" : "url(#arrow-in)";

              // Curva suave em S horizontal
              const dx = (edge.endX - edge.startX) * 0.5;
              const pathD = `M ${edge.startX} ${edge.startY} C ${edge.startX + dx} ${edge.startY}, ${
                edge.endX - dx
              } ${edge.endY}, ${edge.endX} ${edge.endY}`;

              const midX = (edge.startX + edge.endX) / 2;
              const midY = (edge.startY + edge.endY) / 2;

              return (
                <g key={edge.id} className="group">
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2"
                    markerEnd={markerEnd}
                    className="transition-all hover:stroke-width-3"
                  />
                  {/* Rótulo da Chave de Ligação na aresta */}
                  <foreignObject
                    x={midX - 70}
                    y={midY - 10}
                    width="140"
                    height="20"
                    className="pointer-events-none"
                  >
                    <div className="flex items-center justify-center">
                      <span className="px-1.5 py-0.2 rounded bg-background/90 border border-border text-[9px] font-mono font-medium text-muted-foreground truncate shadow-xs">
                        {edge.chaves.split("=")[0]?.trim()}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </g>
        </svg>

        {/* 3. Renderização HTML dos Nós sobre o Canvas SVG */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {nodes.map((node) => {
            const isRoot = node.direction === "root";
            const isSelected = selectedNodeId === node.id;
            const isSecondary = activeSecondaryTable === node.tableName;

            const modConfig = RM_MODULES_CONFIG.find((m) => m.prefix === node.modulePrefix) || {
              shortLabel: node.modulePrefix || "Geral",
              badgeClass: "bg-muted text-foreground border-border",
            };

            if (isRoot) {
              // NÓ CENTRAL EM DESTAQUE (Tabela Raiz)
              return (
                <div
                  key={node.id}
                  style={{
                    position: "absolute",
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.width}px`,
                  }}
                  className="pointer-events-auto rounded-xl border-2 border-primary bg-background shadow-xl ring-4 ring-primary/10 flex flex-col p-3.5 space-y-2 no-pan"
                >
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-base text-foreground tracking-tight">
                        {node.tableName}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-primary text-primary-foreground">
                        Centro
                      </span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${modConfig.badgeClass}`}>
                      {modConfig.shortLabel}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {rootTable.descricao || "Tabela principal inspecionada"}
                  </p>

                  {/* Campos-chave em destaque */}
                  <div className="space-y-1 pt-1 border-t border-border">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Key className="h-2.5 w-2.5 text-amber-500" />
                      <span>Colunas Principais:</span>
                    </div>
                    <div className="space-y-0.5">
                      {rootKeyColumns.map((col, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-center justify-between text-[10px] font-mono py-0.5 px-1.5 rounded bg-muted/50"
                        >
                          <span className="font-bold text-foreground truncate">{col.nome}</span>
                          <span className="text-muted-foreground text-[9px]">{col.tipo}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>
                      <strong className="text-foreground">{rootTable.colunas.length}</strong> colunas
                    </span>
                    <span>
                      <strong className="text-foreground">{nodes.length - 1}</strong> conexões
                    </span>
                  </div>
                </div>
              );
            }

            // NÓS DE RELACIONAMENTO (Saída ou Entrada)
            const isOut = node.direction === "outgoing";

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                style={{
                  position: "absolute",
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${node.width}px`,
                  height: `${node.height}px`,
                }}
                className={`pointer-events-auto rounded-lg border transition-all cursor-pointer flex flex-col justify-between p-2 shadow-sm no-pan ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary"
                    : isSecondary
                    ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30"
                    : "border-border bg-card hover:border-primary/50 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-bold text-xs text-foreground truncate">
                      {node.tableName}
                    </span>
                    {isSecondary && (
                      <span className="text-[9px] font-bold px-1 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        Ao lado
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                      isOut
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                    }`}
                  >
                    {isOut ? "FK Saída" : "FK Entrada"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono truncate w-full">
                  <span className="truncate max-w-[150px]" title={node.chaves}>
                    ON {node.chaves}
                  </span>

                  <span className={`text-[9px] px-1 rounded border ${modConfig.badgeClass}`}>
                    {modConfig.shortLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Popover / Drawer Flutuante de Ações ao Clicar em um Nó Conectado */}
      {selectedNode && selectedNode.direction !== "root" && (
        <div className="absolute bottom-4 right-4 z-30 max-w-sm w-full bg-background border border-border rounded-xl shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-foreground">
                {selectedNode.tableName}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                  selectedNode.direction === "outgoing"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                }`}
              >
                {selectedNode.direction === "outgoing"
                  ? `FK Saída de ${rootTable.tabela}`
                  : `Aponta para ${rootTable.tabela}`}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setSelectedNodeId(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="p-2 rounded bg-muted/40 border border-border space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Chaves de Ligação (ON):</span>
              <button
                onClick={() => handleCopy(`ON ${selectedNode.chaves}`, "pop_keys")}
                className="text-primary hover:underline text-[10px] flex items-center gap-1 cursor-pointer font-medium"
              >
                {copiedKey === "pop_keys" ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-xs text-foreground break-all">
              ON {selectedNode.chaves}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {onOpenSideBySide && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  onOpenSideBySide(selectedNode.tableName);
                  setSelectedNodeId(null);
                }}
                className="flex-1 text-xs gap-1.5 h-8 font-medium shadow-xs"
              >
                <Columns2 className="h-3.5 w-3.5" />
                <span>Abrir Lado a Lado</span>
              </Button>
            )}

            {onSelectTable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onSelectTable(selectedNode.tableName);
                  setSelectedNodeId(null);
                }}
                className="text-xs gap-1.5 h-8 font-medium border-border"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <span>Navegar</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 5. Rodapé informativo do Grafo */}
      <div className="px-4 py-2 border-t border-border bg-muted/15 flex items-center justify-between text-[11px] text-muted-foreground shrink-0 z-20">
        <div className="flex items-center gap-3">
          <span>
            Arraste com o mouse para navegar • Use a roda para zoom
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Clique em qualquer tabela para inspecionar e abrir lado a lado
          </span>
        </div>

        <span className="font-mono text-[10px]">
          Zoom: {Math.round(zoom * 100)}%
        </span>
      </div>
    </div>
  );
}
