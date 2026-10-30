"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Code2,
  Copy,
  Check,
  Sparkles,
  Link2,
  Plus,
  FileCheck,
  Search,
  Columns2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  WrapText,
  BookmarkPlus,
  Binary,
  Layers,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  JoinOpportunity,
  QueryQualityCheck,
  ParsedTableReference,
  appendJoinToQuery,
  appendColumnToSelect,
} from "@/lib/totvs-rm/query-parser";
import { RMSemanticTableWithKey, RMSemanticColumn } from "@/lib/totvs-rm/types";

interface SmartSqlEditorProps {
  sql: string;
  onChangeSql: (newSql: string) => void;
  onFormatSql: () => void;
  tablesInQuery: ParsedTableReference[];
  tableDetailsMap: Record<string, RMSemanticTableWithKey>;
  joinOpportunities: JoinOpportunity[];
  qualityChecks: QueryQualityCheck[];
  onSaveQuery: () => void;
  onSaveAsTemplate: (params: { title: string; description: string; moduleLabel: string }) => void;
  isAuthenticated?: boolean;
}

const TSQL_KEYWORDS = new Set([
  "SELECT",
  "TOP",
  "FROM",
  "INNER",
  "LEFT",
  "RIGHT",
  "FULL",
  "CROSS",
  "JOIN",
  "ON",
  "AND",
  "OR",
  "NOT",
  "WITH",
  "NOLOCK",
  "AS",
  "SET",
  "NOCOUNT",
  "WHERE",
  "ORDER",
  "BY",
  "GROUP",
  "HAVING",
  "IN",
  "IS",
  "NULL",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "DISTINCT",
  "UNION",
  "ALL",
  "LIKE",
  "BETWEEN",
  "EXISTS",
  "COUNT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
]);

interface SyntaxToken {
  type: "keyword" | "schema" | "string" | "comment" | "number" | "operator" | "space" | "text";
  value: string;
}

/**
 * Tokeniza código T-SQL preservando caracteres de espaço exatos
 */
function tokenizeSqlLine(
  line: string,
  inComment: boolean
): { tokens: SyntaxToken[]; endsInComment: boolean } {
  const tokens: SyntaxToken[] = [];
  let currentInComment = inComment;
  let remaining = line;

  if (currentInComment) {
    const closeIdx = remaining.indexOf("*/");
    if (closeIdx !== -1) {
      tokens.push({ type: "comment", value: remaining.substring(0, closeIdx + 2) });
      remaining = remaining.substring(closeIdx + 2);
      currentInComment = false;
    } else {
      tokens.push({ type: "comment", value: remaining });
      return { tokens, endsInComment: true };
    }
  }

  // Regex de captura de tokens SQL
  const regex = /(\/\*[\s\S]*?\*\/)|(\/\*[\s\S]*$)|(--[^\r\n]*)|('(?:''|[^'])*')|(\b\d+\b)|([=,;()<>!+*/-])|(\s+)|([A-Za-z_][A-Za-z0-9_]*)|(.)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(remaining)) !== null) {
    const [full, blockCmt, openBlockCmt, lineCmt, str, num, op, space, word] = match;

    if (blockCmt) {
      tokens.push({ type: "comment", value: blockCmt });
    } else if (openBlockCmt) {
      tokens.push({ type: "comment", value: openBlockCmt });
      currentInComment = true;
    } else if (lineCmt) {
      tokens.push({ type: "comment", value: lineCmt });
    } else if (str) {
      tokens.push({ type: "string", value: str });
    } else if (num) {
      tokens.push({ type: "number", value: num });
    } else if (op) {
      tokens.push({ type: "operator", value: op });
    } else if (space) {
      tokens.push({ type: "space", value: space });
    } else if (word) {
      const u = word.toUpperCase();
      if (u === "CORPORE" || u === "DBO") {
        tokens.push({ type: "schema", value: word });
      } else if (TSQL_KEYWORDS.has(u)) {
        tokens.push({ type: "keyword", value: word });
      } else {
        tokens.push({ type: "text", value: word });
      }
    } else {
      tokens.push({ type: "text", value: full });
    }
  }

  return { tokens, endsInComment: currentInComment };
}

export function SmartSqlEditor({
  sql,
  onChangeSql,
  onFormatSql,
  tablesInQuery,
  tableDetailsMap,
  joinOpportunities,
  qualityChecks,
  onSaveQuery,
  onSaveAsTemplate,
  isAuthenticated = false,
}: SmartSqlEditorProps) {
  const [copied, setCopied] = useState(false);
  const [showAllJoinsModal, setShowAllJoinsModal] = useState(false);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [columnSearchQuery, setColumnSearchQuery] = useState("");
  const [selectedTableForColumns, setSelectedTableForColumns] = useState<string>("all");
  const [showQualityPopover, setShowQualityPopover] = useState(false);

  // Novos Controles: Word Wrap e Visualizador de Espaços
  const [wordWrap, setWordWrap] = useState(false);
  const [showWhitespaceDots, setShowWhitespaceDots] = useState(true);

  // Campos do Modal Salvar como Modelo
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [templateModule, setTemplateModule] = useState("RM Fluxus");

  // Refs para sincronização estrita de scroll
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Scroll sincronizado entre textarea, números de linha e syntax highlight
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
  };

  // Linhas e tokenização em tempo real
  const lines = useMemo(() => sql.split("\n"), [sql]);
  const lineCount = Math.max(lines.length, 12);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const highlightedLines = useMemo(() => {
    let inCmt = false;
    return lines.map((line) => {
      const res = tokenizeSqlLine(line, inCmt);
      inCmt = res.endsInComment;
      return res.tokens;
    });
  }, [lines]);

  // Colunas disponíveis de todas as tabelas na query
  const availableColumns = useMemo(() => {
    const list: { tableName: string; column: RMSemanticColumn }[] = [];
    tablesInQuery.forEach((t) => {
      const details = tableDetailsMap[t.tableName.toUpperCase()];
      if (details && details.colunas) {
        details.colunas.forEach((col) => {
          list.push({ tableName: t.alias || t.tableName, column: col });
        });
      }
    });
    return list;
  }, [tablesInQuery, tableDetailsMap]);

  // Filtragem de colunas para o picker
  const filteredAvailableColumns = useMemo(() => {
    return availableColumns.filter((item) => {
      if (
        selectedTableForColumns !== "all" &&
        item.tableName.toUpperCase() !== selectedTableForColumns.toUpperCase()
      ) {
        return false;
      }
      if (!columnSearchQuery.trim()) return true;
      const q = columnSearchQuery.toLowerCase();
      return (
        item.column.nome.toLowerCase().includes(q) ||
        (item.column.descricao || "").toLowerCase().includes(q) ||
        (item.column.tipo || "").toLowerCase().includes(q)
      );
    });
  }, [availableColumns, selectedTableForColumns, columnSearchQuery]);

  const handleInsertJoin = (opp: JoinOpportunity) => {
    const updated = appendJoinToQuery(sql, opp.formattedSnippet);
    onChangeSql(updated);
  };

  const handleInsertColumn = (tableName: string, colName: string) => {
    const expr = `${tableName}.${colName}`;
    const updated = appendColumnToSelect(sql, expr);
    onChangeSql(updated);
  };

  const handleConfirmSaveTemplate = () => {
    if (!templateTitle.trim()) return;
    onSaveAsTemplate({
      title: templateTitle.trim(),
      description: templateDesc.trim(),
      moduleLabel: templateModule,
    });
    setShowSaveTemplateModal(false);
    setTemplateTitle("");
    setTemplateDesc("");
  };

  const hasErrors = qualityChecks.some((c) => !c.passed && c.severity === "error");
  const hasWarnings = qualityChecks.some((c) => !c.passed && c.severity === "warning");

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-3 sm:p-4 bg-muted/10">
      {/* Card Flutuante do Editor SQL */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
        {/* Barra de Ações Superior do Editor */}
        <div className="p-2 sm:px-3.5 sm:py-2 border-b border-border bg-muted/20 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Lado Esquerdo: Indicadores e Atalhos de Inserção */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground mr-1">
              <Code2 className="h-4 w-4 text-primary" />
              <span>T-SQL Studio</span>
            </div>

            {/* Botão + Campo */}
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 cursor-pointer bg-background"
              onClick={() => setShowColumnPicker(true)}
              disabled={tablesInQuery.length === 0}
              title={
                tablesInQuery.length === 0
                  ? "Adicione uma tabela via FROM para listar campos"
                  : "Buscar e inserir colunas na cláusula SELECT"
              }
            >
              <Plus className="h-3.5 w-3.5 text-primary" />
              <span>+ Campo</span>
            </Button>

            {/* Botão de Ver Todos os JOINs */}
            {joinOpportunities.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1 cursor-pointer bg-primary/5 text-primary border-primary/30 hover:bg-primary/10"
                onClick={() => setShowAllJoinsModal(true)}
                title="Abrir catálogo completo de JOINs possíveis para as tabelas atuais"
              >
                <Link2 className="h-3.5 w-3.5" />
                <span>Ver Todos os JOINs ({joinOpportunities.length})</span>
              </Button>
            )}

            {/* Checklist de Conformidade / Validador RM */}
            <button
              onClick={() => setShowQualityPopover(!showQualityPopover)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                hasErrors
                  ? "bg-destructive/10 text-destructive border-destructive/30"
                  : hasWarnings
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              }`}
              title="Conformidade da query com o padrão corporativo TOTVS RM"
            >
              {hasErrors ? (
                <AlertTriangle className="h-3 w-3" />
              ) : hasWarnings ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <ShieldCheck className="h-3 w-3" />
              )}
              <span>
                {hasErrors
                  ? "Correção Necessária"
                  : hasWarnings
                  ? "Boas Práticas RM"
                  : "Padrão RM Válido"}
              </span>
            </button>
          </div>

          {/* Lado Direito: Visualizadores, Formatação, Cópia e Salvar como Modelo */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Toggle: Visualizador de Espaços (Pontos Cinza) */}
            <button
              onClick={() => setShowWhitespaceDots(!showWhitespaceDots)}
              className={`inline-flex items-center gap-1 h-7 px-2 rounded-md text-xs font-mono font-medium border transition-colors cursor-pointer ${
                showWhitespaceDots
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-background text-muted-foreground border-border hover:text-foreground"
              }`}
              title={showWhitespaceDots ? "Ocultar pontos de espaçamento" : "Exibir pontos cinza nos espaços"}
            >
              <span className="font-bold text-sm leading-none">·</span>
              <span className="text-[11px]">Espaços</span>
            </button>

            {/* Toggle: Word Wrap */}
            <button
              onClick={() => setWordWrap(!wordWrap)}
              className={`inline-flex items-center gap-1 h-7 px-2 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                wordWrap
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-background text-muted-foreground border-border hover:text-foreground"
              }`}
              title={wordWrap ? "Desativar quebra de linha (Word Wrap)" : "Ativar quebra de linha (Word Wrap)"}
            >
              <WrapText className="h-3.5 w-3.5" />
              <span className="text-[11px]">Wrap</span>
            </button>

            {/* Formatar T-SQL */}
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 cursor-pointer bg-background"
              onClick={onFormatSql}
              title="Formata o código no padrão estrito T-SQL TOTVS RM (vírgulas à esquerda, indentação de 3 níveis, NOLOCK)"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="hidden sm:inline">Formatar T-SQL</span>
            </Button>

            {/* Copiar SQL */}
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 cursor-pointer bg-background"
              onClick={handleCopy}
              title="Copiar consulta SQL formatada"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Copiar</span>
                </>
              )}
            </Button>

            {/* Salvar Consulta no Histórico */}
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 cursor-pointer bg-background"
              onClick={onSaveQuery}
              title="Salvar consulta no Histórico de trabalho"
            >
              <span>Salvar Histórico</span>
            </Button>

            {/* Salvar como Modelo (Sincronizado Supabase / Local) */}
            <Button
              size="sm"
              className="h-7 text-xs gap-1 cursor-pointer font-semibold shadow-2xs bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                setTemplateTitle(`Consulta ${tablesInQuery.map((t) => t.tableName).join(" + ") || "T-SQL"}`);
                setShowSaveTemplateModal(true);
              }}
              title="Salvar como modelo permanente (sincronizável com o Supabase)"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              <span>Salvar Modelo</span>
            </Button>
          </div>
        </div>

        {/* BARRA INTELIGENTE DE SUGESTÕES DE JOIN (+ CHIPS RÁPIDOS) */}
        {tablesInQuery.length > 0 && (
          <div className="px-3 py-1.5 border-b border-border bg-muted/15 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
              <Link2 className="h-3 w-3 text-primary" />
              <span>Sugestões de JOIN:</span>
            </span>

            {joinOpportunities.length === 0 ? (
              <span className="text-[11px] text-muted-foreground italic">
                Nenhuma nova ligação direta identificada no dicionário semântico.
              </span>
            ) : (
              joinOpportunities.slice(0, 6).map((opp) => (
                <button
                  key={`${opp.baseTable}-${opp.targetTable}`}
                  onClick={() => handleInsertJoin(opp)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-card hover:bg-primary/10 border border-border hover:border-primary/40 text-foreground transition-all shrink-0 cursor-pointer shadow-2xs group"
                  title={`Inserir JOIN com ${opp.targetTable}: ${opp.chavesLigacao}`}
                >
                  <Plus className="h-3 w-3 text-primary group-hover:scale-125 transition-transform" />
                  <span className="text-primary font-bold">{opp.targetTable}</span>
                  <span className="text-[10px] text-muted-foreground hidden md:inline">
                    via {opp.baseTable}
                  </span>
                </button>
              ))
            )}

            {joinOpportunities.length > 6 && (
              <button
                onClick={() => setShowAllJoinsModal(true)}
                className="text-[11px] text-primary hover:underline font-semibold shrink-0 cursor-pointer ml-1"
              >
                +{joinOpportunities.length - 6} outros...
              </button>
            )}
          </div>
        )}

        {/* POPOVER DE CONFORMIDADE / QUALIDADE T-SQL RM */}
        {showQualityPopover && (
          <div className="absolute top-14 left-4 right-4 sm:right-auto sm:w-96 z-40 p-3 rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-1.5 border-b border-border">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Conformidade Corporativa T-SQL TOTVS RM</span>
              </div>
              <button
                onClick={() => setShowQualityPopover(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              {qualityChecks.map((chk) => (
                <div
                  key={chk.id}
                  className="p-2 rounded-lg bg-muted/40 border border-border/50 flex items-start gap-2"
                >
                  {chk.passed ? (
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : chk.severity === "error" ? (
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{chk.label}</span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          chk.passed
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : chk.severity === "error"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {chk.passed ? "OK" : chk.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{chk.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={() => {
                  onFormatSql();
                  setShowQualityPopover(false);
                }}
              >
                <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                <span>Aplicar Auto-Formatação RM</span>
              </Button>
            </div>
          </div>
        )}

        {/* ÁREA CENTRAL DO EDITOR: SYNTAX HIGHLIGHTING + PONTOS DE ESPAÇO + SCROLL SINCRONIZADO */}
        <div className="flex-1 min-h-0 flex overflow-hidden font-mono text-xs bg-card">
          {/* Coluna de Números de Linha com Scroll Sincronizado */}
          <div
            ref={lineNumbersRef}
            className="w-12 bg-muted/30 border-r border-border text-muted-foreground/60 py-3.5 text-right pr-2.5 select-none overflow-hidden shrink-0"
          >
            {lineNumbers.map((num) => (
              <div key={num} className="leading-[20px] h-[20px]">
                {num}
              </div>
            ))}
          </div>

          {/* Container do Código com Dupla Camada (Syntax + Textarea) */}
          <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
            {/* Camada de Fundo: Syntax Highlighting Estilo IDE + Pontos de Espaço */}
            <pre
              ref={highlightRef}
              aria-hidden="true"
              className={`absolute inset-0 z-0 p-3.5 font-mono text-xs leading-[20px] pointer-events-none select-none overflow-hidden ${
                wordWrap ? "whitespace-pre-wrap break-all" : "whitespace-pre"
              }`}
            >
              {highlightedLines.map((lineTokens, lineIdx) => (
                <div key={lineIdx} className="leading-[20px] h-[20px]">
                  {lineTokens.length === 0 ? (
                    <span>&nbsp;</span>
                  ) : (
                    lineTokens.map((tok, tokIdx) => {
                      if (tok.type === "keyword") {
                        return (
                          <span
                            key={tokIdx}
                            className="text-sky-600 dark:text-sky-400 font-bold"
                          >
                            {tok.value}
                          </span>
                        );
                      }
                      if (tok.type === "schema") {
                        return (
                          <span
                            key={tokIdx}
                            className="text-emerald-600 dark:text-emerald-400 font-semibold"
                          >
                            {tok.value}
                          </span>
                        );
                      }
                      if (tok.type === "comment") {
                        return (
                          <span
                            key={tokIdx}
                            className="text-emerald-700/80 dark:text-emerald-400/70 italic"
                          >
                            {tok.value}
                          </span>
                        );
                      }
                      if (tok.type === "string") {
                        return (
                          <span
                            key={tokIdx}
                            className="text-amber-600 dark:text-amber-400 font-medium"
                          >
                            {tok.value}
                          </span>
                        );
                      }
                      if (tok.type === "number") {
                        return (
                          <span
                            key={tokIdx}
                            className="text-purple-600 dark:text-purple-400 font-mono"
                          >
                            {tok.value}
                          </span>
                        );
                      }
                      if (tok.type === "operator") {
                        return (
                          <span
                            key={tokIdx}
                            className="text-rose-500 dark:text-rose-400 font-semibold"
                          >
                            {tok.value}
                          </span>
                        );
                      }
                      if (tok.type === "space") {
                        if (showWhitespaceDots) {
                          // Substitui cada espaço por um ponto cinza sutil '·'
                          const dots = tok.value.replace(/ /g, "·");
                          return (
                            <span
                              key={tokIdx}
                              className="text-muted-foreground/35 dark:text-muted-foreground/25 font-mono select-none"
                            >
                              {dots}
                            </span>
                          );
                        }
                        return <span key={tokIdx}>{tok.value}</span>;
                      }
                      return (
                        <span key={tokIdx} className="text-foreground">
                          {tok.value}
                        </span>
                      );
                    })
                  )}
                </div>
              ))}
            </pre>

            {/* Camada Frontal: Textarea Editável com Texto Transparente e Caret Visível */}
            <textarea
              ref={textareaRef}
              value={sql}
              onChange={(e) => onChangeSql(e.target.value)}
              onScroll={handleScroll}
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              className={`absolute inset-0 z-10 w-full h-full p-3.5 font-mono text-xs leading-[20px] bg-transparent text-transparent caret-foreground selection:bg-primary/25 resize-none border-none outline-none focus:ring-0 overflow-auto ${
                wordWrap ? "whitespace-pre-wrap break-all" : "whitespace-pre"
              }`}
            />
          </div>
        </div>

        {/* Rodapé Fixo do Editor com Informações Úteis */}
        <div className="shrink-0 border-t border-border bg-muted/20 px-3.5 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
            <span>
              Linhas: <strong className="text-foreground font-mono">{lines.length}</strong>
            </span>
            <span>•</span>
            <span>
              Caracteres: <strong className="text-foreground font-mono">{sql.length}</strong>
            </span>
            <span>•</span>
            <span className="hidden sm:inline">
              Tabelas: <strong className="text-foreground font-mono">{tablesInQuery.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  hasErrors ? "bg-destructive" : hasWarnings ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
              <span className="font-medium">
                {hasErrors ? "Erro de Padrão" : hasWarnings ? "Avisos" : "Padrão T-SQL RM"}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* MODAL: SALVAR COMO MODELO (SUPABASE / LOCAL) */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">
                  Salvar Consulta como Modelo RM
                </h3>
              </div>
              <button
                onClick={() => setShowSaveTemplateModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Título do Modelo *
                </label>
                <Input
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  placeholder="Ex: Lançamentos Financeiros por Filial"
                  className="h-8 text-xs bg-background"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Módulo Principal
                </label>
                <select
                  value={templateModule}
                  onChange={(e) => setTemplateModule(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-xs font-medium text-foreground outline-none"
                >
                  <option value="RM Fluxus">RM Fluxus (Finanças)</option>
                  <option value="RM Nucleus">RM Nucleus (Faturamento/Estoque)</option>
                  <option value="RM Labore">RM Labore (Folha/RH)</option>
                  <option value="RM Saldus">RM Saldus (Contabilidade)</option>
                  <option value="Global">Global / Cadastros Gerais</option>
                  <option value="Personalizado">Personalizado</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  placeholder="Descreva o propósito da consulta e os filtros principais..."
                  rows={2}
                  className="w-full p-2 rounded-md border border-border bg-background text-xs text-foreground outline-none resize-none"
                />
              </div>

              {/* Status de Sincronização Supabase */}
              <div className="p-2.5 rounded-lg border bg-muted/30 text-xs">
                {isAuthenticated ? (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>
                      <strong>Sincronização em Nuvem:</strong> Este modelo será gravado no seu usuário no banco Supabase e ficará disponível em qualquer dispositivo.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Binary className="h-4 w-4 shrink-0 text-amber-500" />
                    <span>
                      <strong>Sessão Local:</strong> Salvo no armazenamento do navegador (Offline). Quando fizer login, seus modelos serão sincronizados com o Supabase.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 border-t border-border bg-muted/10 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveTemplateModal(false)}
                className="text-xs h-7.5"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmSaveTemplate}
                disabled={!templateTitle.trim()}
                className="text-xs h-7.5 font-semibold bg-primary text-primary-foreground"
              >
                Salvar Modelo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SELETOR DE COLUNAS DISPONÍVEIS */}
      {showColumnPicker && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl max-h-[80vh] rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <Columns2 className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">
                  Inserir Campo na Cláusula SELECT
                </h3>
              </div>
              <button
                onClick={() => setShowColumnPicker(false)}
                className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 border-b border-border space-y-2 bg-muted/10">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filtrar campos (ex: CODCOLIGADA, VALOR, DATA)..."
                  value={columnSearchQuery}
                  onChange={(e) => setColumnSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs font-mono bg-background"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
                <button
                  onClick={() => setSelectedTableForColumns("all")}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedTableForColumns === "all"
                      ? "bg-foreground text-background font-semibold"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Todas as Tabelas ({availableColumns.length})
                </button>
                {tablesInQuery.map((t) => (
                  <button
                    key={t.alias}
                    onClick={() => setSelectedTableForColumns(t.alias)}
                    className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold transition-colors cursor-pointer ${
                      selectedTableForColumns === t.alias
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.alias}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[50vh]">
              {filteredAvailableColumns.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Nenhum campo encontrado para o filtro aplicado.
                </div>
              ) : (
                filteredAvailableColumns.map(({ tableName, column }) => {
                  const isPk =
                    column.nome.startsWith("COD") ||
                    column.nome.startsWith("ID") ||
                    column.nome === "CHAPA";

                  return (
                    <div
                      key={`${tableName}.${column.nome}`}
                      onClick={() => {
                        handleInsertColumn(tableName, column.nome);
                        setShowColumnPicker(false);
                      }}
                      className="p-2 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-muted/40 transition-colors flex items-center justify-between gap-2 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isPk && <Key className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                        <span className="font-mono text-xs font-bold text-foreground">
                          <span className="text-muted-foreground">{tableName}.</span>
                          <span>{column.nome}</span>
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted border border-border text-muted-foreground">
                          {column.tipo}
                        </span>
                        <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                          {column.descricao || "—"}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-primary font-semibold"
                      >
                        + Inserir
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TODOS OS JOINS DISPONÍVEIS */}
      {showAllJoinsModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">
                  Catálogo de JOINs Relacionados ({joinOpportunities.length} conexões)
                </h3>
              </div>
              <button
                onClick={() => setShowAllJoinsModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 text-xs text-muted-foreground border-b border-border bg-muted/5">
              Estes são todos os relacionamentos de Chaves Estrangeiras (FKs de saída e entrada)
              mapeados no Dicionário Semântico para as tabelas atualmente na sua consulta.
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {joinOpportunities.map((opp) => (
                <div
                  key={`${opp.baseTable}-${opp.targetTable}`}
                  className="p-3 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {opp.targetTable}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-medium">
                        {opp.isIncoming ? "FK Entrada (Filha)" : "FK Saída (Pai)"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        ligado a <strong className="font-mono">{opp.baseTable}</strong>
                      </span>
                    </div>

                    <div className="font-mono text-[11px] text-muted-foreground/80 bg-muted/40 px-2 py-0.5 rounded inline-block">
                      ON {opp.chavesLigacao}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="h-7 text-xs font-semibold shrink-0 cursor-pointer"
                    onClick={() => {
                      handleInsertJoin(opp);
                      setShowAllJoinsModal(false);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    <span>Inserir este JOIN</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
