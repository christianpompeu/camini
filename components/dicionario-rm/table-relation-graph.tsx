"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

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
  Layers,
  Sparkles,
} from "lucide-react";
import { RMSemanticTableWithKey } from "@/lib/totvs-rm/types";
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

// ---------------------------------------------------------------------------
// 1. Tipos de Nós Customizados
// ---------------------------------------------------------------------------

interface RootNodeData extends Record<string, unknown> {
  table: RMSemanticTableWithKey;
  keyColumns: { nome: string; tipo?: string }[];
  totalColumns: number;
  totalOutgoing: number;
  totalIncoming: number;
  moduleConfig: { shortLabel: string; badgeClass: string };
}

interface RelatedNodeData extends Record<string, unknown> {
  tableName: string;
  direction: "outgoing" | "incoming";
  chaves: string;
  moduleConfig: { shortLabel: string; badgeClass: string };
  isSecondary: boolean;
  onSelectTable?: (tableName: string) => void;
  onOpenSideBySide?: (tableName: string) => void;
  onCopyKey?: (text: string, id: string) => void;
  isCopied?: boolean;
}

// Nó Central (Tabela Raiz)
function RootTableNode({ data }: NodeProps<Node<RootNodeData>>) {
  const { table, keyColumns, totalColumns, totalOutgoing, totalIncoming, moduleConfig } = data;

  return (
    <div className="rounded-xl border-2 border-primary bg-background shadow-xl ring-4 ring-primary/10 flex flex-col p-3.5 space-y-2 w-[260px] text-foreground select-none relative">
      {/* Handle de entrada para conexões que chegam da esquerda */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2.5 !h-2.5 !bg-indigo-500 !border-2 !border-background"
      />

      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-black text-base tracking-tight text-foreground">
            {table.tabela}
          </span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-primary text-primary-foreground">
            Centro
          </span>
        </div>
        <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${moduleConfig.badgeClass}`}>
          {moduleConfig.shortLabel}
        </span>
      </div>

      <div className="text-[11px] text-muted-foreground line-clamp-2">
        {table.descricao || "Sem descrição"}
      </div>

      {keyColumns.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-border/60">
          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Key className="h-2.5 w-2.5 text-amber-500" />
            <span>Colunas Principais:</span>
          </div>
          <div className="space-y-0.5">
            {keyColumns.map((col) => (
              <div
                key={col.nome}
                className="flex items-center justify-between font-mono text-[10px] py-0.5 px-1 rounded bg-muted/40"
              >
                <span className="font-semibold text-foreground truncate max-w-[150px]">
                  {col.nome}
                </span>
                <span className="text-muted-foreground text-[9px]">{col.tipo || "key"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-mono">
        <span>{totalColumns} colunas</span>
        <span>{totalOutgoing + totalIncoming} conexões</span>
      </div>

      {/* Handle de saída para conexões que partem para a direita */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-background"
      />
    </div>
  );
}

// Nó Relacionado (Tabelas Conectadas)
function RelatedTableNode({ data, id }: NodeProps<Node<RelatedNodeData>>) {
  const {
    tableName,
    direction,
    chaves,
    moduleConfig,
    isSecondary,
    onSelectTable,
    onOpenSideBySide,
    onCopyKey,
    isCopied,
  } = data;
  const isOut = direction === "outgoing";

  return (
    <div
      className={`group rounded-lg border bg-background/95 backdrop-blur-xs p-2.5 shadow-xs transition-all hover:shadow-md hover:border-primary/60 flex flex-col gap-1.5 w-[250px] select-none relative ${
        isSecondary
          ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5"
          : "border-border hover:bg-muted/30"
      }`}
    >
      {/* Handle ancorado na lateral correta */}
      {isOut ? (
        <Handle
          type="target"
          position={Position.Left}
          id="target"
          className="!w-2 !h-2 !bg-blue-500 !border-2 !border-background"
        />
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          id="source"
          className="!w-2 !h-2 !bg-indigo-500 !border-2 !border-background"
        />
      )}

      {/* Linha superior: Nome da tabela + Tags */}
      <div className="flex items-center justify-between gap-1">
        <span className="font-mono font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors">
          {tableName}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`text-[9px] font-semibold px-1 py-0.2 rounded ${
              isOut
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
            }`}
          >
            {isOut ? "FK Saída" : "FK Entrada"}
          </span>
          <span className={`text-[9px] px-1 py-0.2 rounded border font-mono ${moduleConfig.badgeClass}`}>
            {moduleConfig.shortLabel}
          </span>
        </div>
      </div>

      {/* Cláusula ON de junção */}
      <div className="text-[10px] font-mono text-muted-foreground truncate bg-muted/40 px-1.5 py-0.5 rounded border border-border/40 flex items-center justify-between gap-1">
        <span className="truncate" title={`ON ${chaves}`}>
          ON {chaves.split("=")[0]?.trim()}
        </span>
        {onCopyKey && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopyKey(`ON ${chaves}`, id);
            }}
            className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            title="Copiar condição de junção ON"
          >
            {isCopied ? (
              <Check className="h-2.5 w-2.5 text-emerald-500" />
            ) : (
              <Copy className="h-2.5 w-2.5" />
            )}
          </button>
        )}
      </div>

      {/* Ações rápidas no rodapé do nó */}
      <div className="flex items-center justify-end gap-1 pt-0.5">
        {onOpenSideBySide && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSideBySide(tableName);
            }}
            className="h-6 px-1.5 rounded text-[10px] font-medium flex items-center gap-1 bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-colors cursor-pointer"
            title="Abrir esta tabela na coluna ao lado"
          >
            <Columns2 className="h-3 w-3" />
            <span>Ao lado</span>
          </button>
        )}

        {onSelectTable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectTable(tableName);
            }}
            className="h-6 px-1.5 rounded text-[10px] font-medium flex items-center gap-1 bg-muted hover:bg-foreground hover:text-background text-muted-foreground transition-colors cursor-pointer"
            title="Tornar esta tabela a tabela primária"
          >
            <span>Ver</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

const nodeTypes = {
  rootTable: RootTableNode,
  relatedTable: RelatedTableNode,
};

// ---------------------------------------------------------------------------
// 2. Componente Interno do Grafo (com acesso a useReactFlow)
// ---------------------------------------------------------------------------

function TableRelationGraphInner({
  rootTable,
  onSelectTable,
  onOpenSideBySide,
  activeSecondaryTable,
  className = "",
  compact = false,
}: TableRelationGraphProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const [filterDirection, setFilterDirection] = useState<"all" | "outgoing" | "incoming">("all");
  const [filterTerm, setFilterTerm] = useState("");
  const [maxDisplay, setMaxDisplay] = useState<number | "all">(36);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Copiar chave
  const handleCopyKey = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 1800);
  }, []);

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

  // Listas brutas filtradas por busca
  const fullOutgoing = useMemo(() => {
    const list = rootTable.relacionamentos_saida || [];
    if (!filterTerm) return list;
    const q = filterTerm.toUpperCase();
    return list.filter(
      (r) => r.tabela_destino.toUpperCase().includes(q) || r.chaves_ligacao.toUpperCase().includes(q)
    );
  }, [rootTable.relacionamentos_saida, filterTerm]);

  const fullIncoming = useMemo(() => {
    const list = rootTable.relacionamentos_entrada || [];
    if (!filterTerm) return list;
    const q = filterTerm.toUpperCase();
    return list.filter(
      (r) => r.tabela_origem.toUpperCase().includes(q) || r.chaves_ligacao.toUpperCase().includes(q)
    );
  }, [rootTable.relacionamentos_entrada, filterTerm]);

  // Fatiamento por limite para evitar explosão de linhas
  const outgoingList = useMemo(() => {
    if (filterDirection === "incoming") return [];
    if (maxDisplay === "all") return fullOutgoing;
    return fullOutgoing.slice(0, maxDisplay);
  }, [fullOutgoing, filterDirection, maxDisplay]);

  const incomingList = useMemo(() => {
    if (filterDirection === "outgoing") return [];
    if (maxDisplay === "all") return fullIncoming;
    return fullIncoming.slice(0, maxDisplay);
  }, [fullIncoming, filterDirection, maxDisplay]);

  // Módulo da raiz
  const rootModConfig = useMemo(() => {
    const prefix = rootTable.tabela.charAt(0);
    return (
      RM_MODULES_CONFIG.find((m) => m.prefix === prefix) || {
        shortLabel: prefix || "Geral",
        badgeClass: "bg-muted text-foreground border-border",
      }
    );
  }, [rootTable.tabela]);

  // Construção de Nós e Arestas com Layout em Grade Equilibrada
  const { initialNodes, initialEdges } = useMemo(() => {
    const calculatedNodes: Node[] = [];
    const calculatedEdges: Edge[] = [];

    const rootId = `root_${rootTable.tabela}`;

    // 1. Nó Raiz (Centro absoluto 0,0)
    calculatedNodes.push({
      id: rootId,
      type: "rootTable",
      position: { x: 0, y: 0 },
      data: {
        table: rootTable,
        keyColumns: rootKeyColumns,
        totalColumns: rootTable.colunas?.length || 0,
        totalOutgoing: rootTable.relacionamentos_saida?.length || 0,
        totalIncoming: rootTable.relacionamentos_entrada?.length || 0,
        moduleConfig: rootModConfig,
      },
    });

    const nodeWidth = 250;
    const nodeHeight = 84;
    const verticalGap = 16;
    const colGap = 80;
    const MAX_PER_COL = 10;

    // 2. Nós de Saída (Lado Direito da Raiz)
    outgoingList.forEach((rel, idx) => {
      const colIndex = Math.floor(idx / MAX_PER_COL);
      const rowIndex = idx % MAX_PER_COL;
      const countInCol = Math.min(MAX_PER_COL, outgoingList.length - colIndex * MAX_PER_COL);

      const nodeX = 420 + colIndex * (nodeWidth + colGap);
      const nodeY = (rowIndex - (countInCol - 1) / 2) * (nodeHeight + verticalGap);
      const nodeId = `out_${rel.tabela_destino}_${idx}`;

      const prefix = rel.tabela_destino.charAt(0);
      const modConfig = RM_MODULES_CONFIG.find((m) => m.prefix === prefix) || {
        shortLabel: prefix || "Geral",
        badgeClass: "bg-muted text-foreground border-border",
      };

      calculatedNodes.push({
        id: nodeId,
        type: "relatedTable",
        position: { x: nodeX, y: nodeY },
        data: {
          tableName: rel.tabela_destino,
          direction: "outgoing",
          chaves: rel.chaves_ligacao,
          moduleConfig: modConfig,
          isSecondary: activeSecondaryTable === rel.tabela_destino,
          onSelectTable,
          onOpenSideBySide,
          onCopyKey: handleCopyKey,
          isCopied: copiedKeyId === nodeId,
        },
      });

      calculatedEdges.push({
        id: `edge_${nodeId}`,
        source: rootId,
        sourceHandle: "right",
        target: nodeId,
        targetHandle: "target",
        type: "bezier",
        style: { stroke: "#3b82f6", strokeWidth: 1.5, strokeOpacity: 0.8 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#3b82f6",
          width: 12,
          height: 12,
        },
        label: rel.chaves_ligacao.split("=")[0]?.trim(),
        labelStyle: { fill: "#64748b", fontSize: 9, fontFamily: "monospace", fontWeight: 600 },
        labelBgStyle: {
          fill: "var(--background, #ffffff)",
          fillOpacity: 0.95,
          stroke: "#cbd5e1",
          strokeWidth: 0.75,
          rx: 4,
          ry: 4,
        },
        labelBgPadding: [4, 2] as [number, number],
      });
    });

    // 3. Nós de Entrada (Lado Esquerdo da Raiz)
    incomingList.forEach((rel, idx) => {
      const colIndex = Math.floor(idx / MAX_PER_COL);
      const rowIndex = idx % MAX_PER_COL;
      const countInCol = Math.min(MAX_PER_COL, incomingList.length - colIndex * MAX_PER_COL);

      const nodeX = -420 - nodeWidth - colIndex * (nodeWidth + colGap);
      const nodeY = (rowIndex - (countInCol - 1) / 2) * (nodeHeight + verticalGap);
      const nodeId = `in_${rel.tabela_origem}_${idx}`;

      const prefix = rel.tabela_origem.charAt(0);
      const modConfig = RM_MODULES_CONFIG.find((m) => m.prefix === prefix) || {
        shortLabel: prefix || "Geral",
        badgeClass: "bg-muted text-foreground border-border",
      };

      calculatedNodes.push({
        id: nodeId,
        type: "relatedTable",
        position: { x: nodeX, y: nodeY },
        data: {
          tableName: rel.tabela_origem,
          direction: "incoming",
          chaves: rel.chaves_ligacao,
          moduleConfig: modConfig,
          isSecondary: activeSecondaryTable === rel.tabela_origem,
          onSelectTable,
          onOpenSideBySide,
          onCopyKey: handleCopyKey,
          isCopied: copiedKeyId === nodeId,
        },
      });

      calculatedEdges.push({
        id: `edge_${nodeId}`,
        source: nodeId,
        sourceHandle: "source",
        target: rootId,
        targetHandle: "left",
        type: "bezier",
        style: { stroke: "#6366f1", strokeWidth: 1.5, strokeOpacity: 0.8 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
          width: 12,
          height: 12,
        },
        label: rel.chaves_ligacao.split("=")[0]?.trim(),
        labelStyle: { fill: "#64748b", fontSize: 9, fontFamily: "monospace", fontWeight: 600 },
        labelBgStyle: {
          fill: "var(--background, #ffffff)",
          fillOpacity: 0.95,
          stroke: "#cbd5e1",
          strokeWidth: 0.75,
          rx: 4,
          ry: 4,
        },
        labelBgPadding: [4, 2] as [number, number],
      });
    });

    return { initialNodes: calculatedNodes, initialEdges: calculatedEdges };
  }, [
    rootTable,
    rootKeyColumns,
    rootModConfig,
    outgoingList,
    incomingList,
    activeSecondaryTable,
    onSelectTable,
    onOpenSideBySide,
    handleCopyKey,
    copiedKeyId,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sincronizar nós e arestas quando as listas mudam
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Centralizar automaticamente com FitView na troca de tabela
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: compact ? 0.1 : 0.2, duration: 400 });
    }, 100);
    return () => clearTimeout(timer);
  }, [rootTable.tabela, fitView, compact]);

  // Nó atualmente selecionado para inspeção
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const found = nodes.find((n) => n.id === selectedNodeId);
    if (!found || found.type === "rootTable") return null;
    return found.data as unknown as RelatedNodeData;
  }, [selectedNodeId, nodes]);

  const totalPossible =
    (rootTable.relacionamentos_saida?.length || 0) +
    (rootTable.relacionamentos_entrada?.length || 0);
  const currentRendered = outgoingList.length + incomingList.length;

  return (
    <div
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
              className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                filterDirection === "all"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todas ({totalPossible})
            </button>
            <button
              onClick={() => setFilterDirection("outgoing")}
              className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                filterDirection === "outgoing"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowRight className="h-3 w-3 text-blue-500" />
              <span>Saída ({rootTable.relacionamentos_saida?.length || 0})</span>
            </button>
            <button
              onClick={() => setFilterDirection("incoming")}
              className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                filterDirection === "incoming"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowDownLeft className="h-3 w-3 text-indigo-500" />
              <span>Entrada ({rootTable.relacionamentos_entrada?.length || 0})</span>
            </button>
          </div>

          {/* Seletor de Limite de Conexões Visíveis */}
          {totalPossible > 20 && (
            <div className="flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded border border-border text-[10px] text-muted-foreground">
              <span>Limite:</span>
              {[20, 40, 80].map((lim) => (
                <button
                  key={lim}
                  onClick={() => setMaxDisplay(lim)}
                  className={`px-1.5 py-0.2 rounded font-mono cursor-pointer transition-colors ${
                    maxDisplay === lim
                      ? "bg-foreground text-background font-bold"
                      : "hover:text-foreground"
                  }`}
                >
                  {lim}
                </button>
              ))}
              <button
                onClick={() => setMaxDisplay("all")}
                className={`px-1.5 py-0.2 rounded font-mono cursor-pointer transition-colors ${
                  maxDisplay === "all"
                    ? "bg-foreground text-background font-bold"
                    : "hover:text-foreground"
                }`}
                title="Exibir todas as conexões (pode deixar o grafo denso)"
              >
                Todas
              </button>
            </div>
          )}
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
                className="absolute right-1.5 top-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => zoomIn({ duration: 250 })}
              title="Aumentar zoom"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => zoomOut({ duration: 250 })}
              title="Diminuir zoom"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => fitView({ padding: 0.15, duration: 400 })}
              title="Centralizar e ajustar visão"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Área Interativa React Flow com Grid e Conexões Infinitas */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-background">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => {
            if (node.type === "rootTable") {
              setSelectedNodeId(null);
            } else {
              setSelectedNodeId(node.id);
            }
          }}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
          fitViewOptions={{ padding: compact ? 0.1 : 0.2 }}
          minZoom={0.2}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
          className="camini-react-flow"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls showInteractive={false} className="!bg-background !border-border !shadow-md" />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="!bg-background/90 !border-border !rounded-lg !shadow-lg hidden md:block"
            nodeColor={(n) => (n.type === "rootTable" ? "var(--color-primary, #3b82f6)" : "#94a3b8")}
          />
        </ReactFlow>

        {/* 3. Popover Informativo Flutuante ao Clicar em um Nó Conectado */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 z-30 w-72 rounded-xl border border-border bg-background/95 p-3.5 shadow-2xl backdrop-blur-md space-y-2.5 animate-in fade-in-50 slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-sm text-foreground">
                  {selectedNode.tableName}
                </span>
                <span
                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                    selectedNode.direction === "outgoing"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                  }`}
                >
                  {selectedNode.direction === "outgoing" ? "FK Saída" : "FK Entrada"}
                </span>
              </div>

              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer rounded hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-2 rounded bg-muted/40 border border-border space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Chaves de Ligação (ON):</span>
                <button
                  onClick={() =>
                    handleCopyKey(`ON ${selectedNode.chaves}`, `pop_${selectedNode.tableName}`)
                  }
                  className="text-primary hover:underline text-[10px] flex items-center gap-1 cursor-pointer font-medium"
                >
                  {copiedKeyId === `pop_${selectedNode.tableName}` ? (
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
                  className="flex-1 text-xs gap-1.5 h-8 font-medium shadow-xs cursor-pointer"
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
                  className="text-xs gap-1.5 h-8 font-medium border-border cursor-pointer"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Navegar</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Rodapé Informativo do Grafo */}
      <div className="px-4 py-2 border-t border-border bg-muted/15 flex items-center justify-between text-[11px] text-muted-foreground shrink-0 z-20">
        <div className="flex items-center gap-3 flex-wrap">
          <span>
            Arraste os nós ou o fundo para navegar • Roda do mouse para zoom
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Linhas curvas mantidas permanentemente ancoradas
          </span>
          {currentRendered < totalPossible && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Exibindo {currentRendered} de {totalPossible} conexões (use a busca ou limite para expandir)
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span>{nodes.length} nós ativos</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Export Principal com Provider
// ---------------------------------------------------------------------------

export function TableRelationGraph(props: TableRelationGraphProps) {
  return (
    <ReactFlowProvider>
      <TableRelationGraphInner {...props} />
    </ReactFlowProvider>
  );
}
