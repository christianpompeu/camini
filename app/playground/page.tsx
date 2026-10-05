"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Palette,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Info,
  Calendar,
  Users,
  Trash2,
  ChevronRight,
  Sliders,
  Bell,
  Eye,
  Settings,
  Plus,
  Loader2,
} from "lucide-react";

// Componentes Reais do Camini
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";

export default function DesignSystemPlaygroundPage() {
  const [activeTab, setActiveTab] = useState<
    "todos" | "fundamentos" | "acoes" | "formularios" | "conteudo" | "feedback" | "navegacao"
  >("todos");

  // Estados dos componentes interativos do sandbox
  const [demoSwitch, setDemoSwitch] = useState(true);
  const [demoInput, setDemoInput] = useState("Christian Pompeu");
  const [demoLoading, setDemoLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  // Simulação de ação assíncrona
  const handleSimulateAsync = () => {
    setDemoLoading(true);
    setTimeout(() => {
      setDemoLoading(false);
      toast.success("Ação de demonstração concluída com sucesso!");
    }, 1200);
  };

  const navCategories = [
    { id: "todos", label: "Visão Geral" },
    { id: "fundamentos", label: "Fundamentos" },
    { id: "acoes", label: "Ações" },
    { id: "formularios", label: "Formulários" },
    { id: "conteudo", label: "Conteúdo" },
    { id: "feedback", label: "Feedback & Modais" },
    { id: "navegacao", label: "Navegação" },
  ] as const;

  const colorTokens = [
    {
      name: "Background",
      varName: "--background",
      description: "Fundo base de toda a aplicação",
      lightHex: "#FFFFFF",
      darkHex: "#18181B",
      sampleClass: "bg-background border border-border text-foreground",
    },
    {
      name: "Foreground",
      varName: "--foreground",
      description: "Cor principal de tipografia e ícones",
      lightHex: "#18181B",
      darkHex: "#FAFAFA",
      sampleClass: "bg-foreground text-background",
    },
    {
      name: "Card",
      varName: "--card",
      description: "Superfície de cartões, formulários e seções",
      lightHex: "#FFFFFF",
      darkHex: "#27272A",
      sampleClass: "bg-card border border-border text-card-foreground",
    },
    {
      name: "Primary",
      varName: "--primary",
      description: "Ações dominantes e elementos de foco",
      lightHex: "#27272A",
      darkHex: "#ECECEE",
      sampleClass: "bg-primary text-primary-foreground",
    },
    {
      name: "Secondary",
      varName: "--secondary",
      description: "Superfícies atenuadas e botões secundários",
      lightHex: "#F4F4F5",
      darkHex: "#3F3F46",
      sampleClass: "bg-secondary text-secondary-foreground",
    },
    {
      name: "Muted",
      varName: "--muted",
      description: "Subtítulos, legendas e fundos discretos",
      lightHex: "#F4F4F5",
      darkHex: "#3F3F46",
      sampleClass: "bg-muted text-muted-foreground",
    },
    {
      name: "Border",
      varName: "--border",
      description: "Linhas divisórias, tabelas e molduras",
      lightHex: "#E4E4E7",
      darkHex: "rgba(255,255,255,0.1)",
      sampleClass: "border-2 border-border bg-transparent text-foreground",
    },
    {
      name: "Destructive",
      varName: "--destructive",
      description: "Exclusão, erros críticos e alertas de perigo",
      lightHex: "#EF4444",
      darkHex: "#F87171",
      sampleClass: "bg-destructive text-white",
    },
  ];

  const radiusTokens = [
    { token: "--radius-sm", value: "calc(var(--radius) - 4px) • ~6px", desc: "Badges compactos, tooltips" },
    { token: "--radius-md", value: "calc(var(--radius) - 2px) • ~8px", desc: "Inputs, botões, tags" },
    { token: "--radius-lg", value: "var(--radius) • 10px", desc: "Cards padrão, containers" },
    { token: "--radius-xl", value: "calc(var(--radius) + 4px) • 14px", desc: "Diálogos, modais, sheets" },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {/* Barra de Navegação Pública OpenDocs */}
        <Navbar />

        {/* Sub-Header Contextual com Tabs de Categoria */}
        <div className="sticky top-14 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Início
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">Design System</span>
            </div>

            {/* Tabs de Filtro de Seção */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {navCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === cat.id
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conteúdo Principal do Catálogo */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
          {/* Apresentação do Design System */}
          <div className="space-y-4 pb-8 border-b border-border">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs font-normal">
                Studio Admin Baseline
              </Badge>
              <Badge variant="secondary" className="text-xs font-normal">
                Base UI Primitives
              </Badge>
              <Badge variant="secondary" className="text-xs font-normal">
                WCAG AA Contrast
              </Badge>
              <Badge variant="secondary" className="text-xs font-normal">
                Tailwind CSS v4
              </Badge>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Catálogo de Componentes e Design System
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                Referência visual e técnica oficial do Camini. Todos os exemplos abaixo utilizam
                os componentes e tokens reais do projeto com renderização nativa Base UI, sem duplicatas estáticas.
              </p>
            </div>

            {/* Aviso de Dados Locais Isolados */}
            <div className="p-3 rounded-md bg-muted/40 border border-border text-xs text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong>Ambiente de Demonstração Isolado:</strong> os controles interativos abaixo operam sobre estados locais em memória, sem disparar mutações no banco de dados Supabase nem APIs de produção.
              </span>
            </div>
          </div>

          {/* =========================================================================
              1. FUNDAMENTOS: TOKENS, CORES, TIPOGRAFIA E RAIOS
             ========================================================================= */}
          {(activeTab === "todos" || activeTab === "fundamentos") && (
            <section className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    1. Fundamentos Visuais
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tokens semânticos neutros adaptáveis aos modos claro e escuro.
                </p>
              </div>

              {/* Grid de Cores Semânticas */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tokens Semânticos de Cor
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {colorTokens.map((c) => (
                    <div
                      key={c.name}
                      className="rounded-lg border border-border bg-card p-3 shadow-xs space-y-2.5 flex flex-col justify-between"
                    >
                      <div
                        className={`h-12 w-full rounded-md flex items-center justify-center font-mono text-xs font-bold shadow-xs ${c.sampleClass}`}
                      >
                        {c.name}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">{c.name}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{c.varName}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          {c.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Escala de Tipografia */}
              <div className="space-y-3 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Escala Tipográfica (Geist Sans & Geist Mono)
                </h3>
                <div className="rounded-lg border border-border bg-card divide-y divide-border overflow-hidden shadow-xs">
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground w-36 shrink-0">
                      text-2xl / font-bold
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex-1">
                      Título Principal da Página
                    </h1>
                  </div>

                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground w-36 shrink-0">
                      text-lg / font-semibold
                    </span>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground flex-1">
                      Cabeçalho de Seção ou Card
                    </h2>
                  </div>

                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground w-36 shrink-0">
                      text-sm / font-medium
                    </span>
                    <p className="text-sm text-foreground flex-1">
                      Texto de leitura corporativa, rótulos de campos e células de tabela.
                    </p>
                  </div>

                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground w-36 shrink-0">
                      text-xs / muted
                    </span>
                    <p className="text-xs text-muted-foreground flex-1">
                      Legendas contextuais, metadados, breadcrumbs e instruções secundárias.
                    </p>
                  </div>

                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground w-36 shrink-0">
                      font-mono / text-xs
                    </span>
                    <code className="font-mono text-xs text-foreground bg-muted px-2 py-1 rounded-md flex-1">
                      SELECT id, professor_id, disciplina_id FROM ctc_aulas LIMIT 5;
                    </code>
                  </div>
                </div>
              </div>

              {/* Border Radius Tokens */}
              <div className="space-y-3 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Raios de Borda (Border Radius)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {radiusTokens.map((r) => (
                    <div
                      key={r.token}
                      className="rounded-lg border border-border bg-card p-3 shadow-xs space-y-1.5"
                    >
                      <div className="font-mono text-xs font-semibold text-primary">{r.token}</div>
                      <div className="text-xs text-foreground font-medium">{r.value}</div>
                      <div className="text-[11px] text-muted-foreground">{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* =========================================================================
              2. AÇÕES: BUTTON VARIANTES, TAMANHOS E ESTADOS
             ========================================================================= */}
          {(activeTab === "todos" || activeTab === "acoes") && (
            <section className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    2. Ações & Botões
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Componente Button com suporte a Base UI render prop, variantes Studio e tamanhos responsivos.
                </p>
              </div>

              {/* Variantes de Botão */}
              <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Variantes de Estilo
                </h3>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button variant="default">Default (Primário)</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link Style</Button>
                </div>
              </div>

              {/* Tamanhos de Botão */}
              <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tamanhos Disponíveis
                </h3>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button size="sm">Small (h-8)</Button>
                  <Button size="default">Default (h-9)</Button>
                  <Button size="lg">Large (h-11)</Button>
                  <Button size="icon" title="Ícone Normal">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button size="icon-sm" variant="outline" title="Ícone Pequeno">
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Estados de Interação: Loading e Disabled */}
              <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estados de Carregamento & Desabilitado
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button disabled>Desabilitado</Button>
                  <Button variant="outline" disabled>
                    Outline Desabilitado
                  </Button>
                  <Button
                    onClick={handleSimulateAsync}
                    disabled={demoLoading}
                    className="gap-2"
                  >
                    {demoLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Clique para Testar Loading</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* =========================================================================
              3. FORMULÁRIOS: INPUTS, LABELS, TEXTAREA, SELECT, SWITCH
             ========================================================================= */}
          {(activeTab === "todos" || activeTab === "formularios") && (
            <section className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    3. Controles de Formulário
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Campos de entrada com estados de foco, erro semântico, textos de ajuda e switches acessíveis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Inputs de Texto */}
                <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Campos de Texto (Input)
                  </h3>

                  <div className="space-y-1.5">
                    <Label htmlFor="demo-name" className="text-xs font-medium">
                      Nome Completo <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="demo-name"
                      value={demoInput}
                      onChange={(e) => setDemoInput(e.target.value)}
                      placeholder="Ex: Christian Pompeu"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Exemplo com valor preenchido e binding de estado local.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="demo-error" className="text-xs font-medium text-destructive">
                      Campo com Erro de Validação
                    </Label>
                    <Input
                      id="demo-error"
                      defaultValue="valor_invalido"
                      error="O formato de e-mail informado é inválido."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="demo-disabled" className="text-xs font-medium text-muted-foreground">
                      Campo Desabilitado
                    </Label>
                    <Input
                      id="demo-disabled"
                      disabled
                      defaultValue="Registro bloqueado pelo sistema"
                    />
                  </div>
                </div>

                {/* Textarea, Switch e Select */}
                <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Textarea, Select & Switch
                  </h3>

                  <div className="space-y-1.5">
                    <Label htmlFor="demo-textarea" className="text-xs font-medium">
                      Ementa / Descrição (Textarea)
                    </Label>
                    <Textarea
                      id="demo-textarea"
                      placeholder="Descreva a matéria ou observações..."
                      defaultValue="Estudo introdutório sobre doutrina, teologia sistemática e hermenêutica bíblica."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="demo-select" className="text-xs font-medium">
                      Seleção Dropdown (Select)
                    </Label>
                    <select
                      id="demo-select"
                      aria-label="Seleção de exemplo"
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="1">Curso de Teologia Cristã (CTC)</option>
                      <option value="2">Módulo RM SQL AI</option>
                      <option value="3">Módulo FORÇA</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="demo-switch" className="text-xs font-medium cursor-pointer">
                        Notificações Automáticas
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Status atual: {demoSwitch ? "Ativado" : "Desativado"}
                      </p>
                    </div>
                    <Switch
                      id="demo-switch"
                      checked={demoSwitch}
                      onCheckedChange={setDemoSwitch}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* =========================================================================
              4. CONTEÚDO: CARDS, BADGES, TABELAS E SKELETONS
             ========================================================================= */}
          {(activeTab === "todos" || activeTab === "conteudo") && (
            <section className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    4. Conteúdo & Visualização de Dados
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cards de indicadores, badges de status, tabelas padronizadas e placeholders skeleton.
                </p>
              </div>

              {/* Badges */}
              <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pílulas & Badges de Estado
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive / Alerta</Badge>
                  <Badge variant="outline" className="gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Ativo
                  </Badge>
                </div>
              </div>

              {/* Cards de Métricas Studio */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cards de Indicadores (Dashboard Baseline)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card size="sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xs font-medium text-muted-foreground">
                        Professores Cadastrados
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">10</div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Corpo docente regular do CTC
                      </p>
                    </CardContent>
                  </Card>

                  <Card size="sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xs font-medium text-muted-foreground">
                        Disciplinas Ativas
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">19</div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Grade curricular acadêmica
                      </p>
                    </CardContent>
                  </Card>

                  <Card size="sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xs font-medium text-muted-foreground">
                        Aulas Programadas
                      </CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">77</div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Cronograma sincronizado
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Tabela de Demonstração */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tabela Responsiva Padronizada
                </h3>
                <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Código</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Disciplina</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Docente Responsável</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Carga Horária</TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-xs text-muted-foreground">CTC-01</TableCell>
                        <TableCell className="font-medium text-foreground">Hamartiologia</TableCell>
                        <TableCell className="text-sm text-muted-foreground">Pr. Caetano Soares</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal text-xs">40 horas</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400">Ativa</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs text-muted-foreground">CTC-02</TableCell>
                        <TableCell className="font-medium text-foreground">Eclesiologia</TableCell>
                        <TableCell className="text-sm text-muted-foreground">Christian Pompeu</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal text-xs">60 horas</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400">Ativa</Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Skeletons com Shimmer */}
              <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Placeholders Skeleton (Carregamento Assíncrono)
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSkeleton(!showSkeleton)}
                    className="text-xs h-7"
                  >
                    {showSkeleton ? "Restaurar Conteúdo" : "Simular Shimmer"}
                  </Button>
                </div>

                {showSkeleton ? (
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Clique em &quot;Simular Shimmer&quot; para visualizar os blocos com animação de pulso neutra sem deslocamento de layout (CLS zero).
                  </p>
                )}
              </div>
            </section>
          )}

          {/* =========================================================================
              5. FEEDBACK, INTERAÇÃO & MODAIS (ALERTS, DIALOGS, SHEETS, TOASTS)
             ========================================================================= */}
          {(activeTab === "todos" || activeTab === "feedback") && (
            <section className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    5. Feedback, Notificações & Diálogos
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Modais com foco acessível (@base-ui/react), sheets laterais, alertas de estado e toasts interativos.
                </p>
              </div>

              {/* Banners e Alertas */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Alertas em Linha (Alert)
                </h3>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Informação do Sistema</AlertTitle>
                  <AlertDescription>
                    As alterações realizadas no cadastro são automaticamente revalidadas no cache do servidor.
                  </AlertDescription>
                </Alert>

                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Atenção à Integridade Referencial</AlertTitle>
                  <AlertDescription>
                    Registros com vínculos ativos em aulas são protegidos contra exclusão acidental via chave estrangeira RESTRICT.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Diálogos e Modais Interativos */}
              <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Modais & Diálogos Base UI
                </h3>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Dialog Normal */}
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger render={<Button variant="outline" className="text-xs" />}>
                      Abrir Dialog Padrão
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Demonstração de Diálogo</DialogTitle>
                        <DialogDescription>
                          Exemplo de janela modal Base UI com backdrop suave e fechamento por Escape.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-2 text-sm text-muted-foreground">
                        Este é um modal de demonstração do catálogo de componentes.
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Fechar
                        </Button>
                        <Button onClick={() => { setDialogOpen(false); toast.success("Ação confirmada!"); }}>
                          Salvar Alterações
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* AlertDialog Destrutivo */}
                  <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
                    <AlertDialogTrigger render={<Button variant="destructive" className="text-xs" />}>
                      Abrir Confirmação Destrutiva
                    </AlertDialogTrigger>
                    <AlertDialogContent className="sm:max-w-md">
                      <AlertDialogHeader>
                        <div className="mb-2 inline-flex size-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                          <Trash2 className="size-5" />
                        </div>
                        <AlertDialogTitle>Excluir Registro de Teste</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja prosseguir com a exclusão deste item? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => {
                            setAlertDialogOpen(false);
                            toast.success("Registro excluído com sucesso (simulação).");
                          }}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Sheet Lateral */}
                  <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger render={<Button variant="secondary" className="text-xs" />}>
                      Abrir Drawer Lateral (Sheet)
                    </SheetTrigger>
                    <SheetContent side="right" className="sm:max-w-sm">
                      <SheetHeader>
                        <SheetTitle>Painel Lateral de Configurações</SheetTitle>
                        <SheetDescription>
                          Exemplo de gaveta deslizante para edição rápida ou navegação em dispositivos móveis.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-4 space-y-3 text-xs text-muted-foreground">
                        <p>O componente Sheet utiliza foco controlado e fechamento com deslize suave.</p>
                      </div>
                      <SheetFooter>
                        <Button variant="outline" onClick={() => setSheetOpen(false)}>
                          Concluir
                        </Button>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>

                  {/* Tooltip */}
                  <Tooltip>
                    <TooltipTrigger render={<Button variant="ghost" size="icon" title="Dica" />}>
                      <Eye className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Tooltip informativo com ponta direcional
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Notificações Toast via Sonner */}
              <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Notificações Toast (Sonner)
                </h3>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success("Professor excluído com sucesso.")}
                  >
                    Toast de Sucesso
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toast.error("Não é possível excluir: existem 14 aulas vinculadas.")
                    }
                  >
                    Toast de Erro / Bloqueio
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info("Sincronização em segundo plano iniciada.")}
                  >
                    Toast de Informação
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* =========================================================================
              6. NAVEGAÇÃO & LAYOUT: BREADCRUMBS, TABS E PAGINAÇÃO
             ========================================================================= */}
          {(activeTab === "todos" || activeTab === "navegacao") && (
            <section className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    6. Padrões de Navegação & Layout
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Estruturas consistentes de migalhas de pão, paginação de tabelas e alternância de temas.
                </p>
              </div>

              {/* Breadcrumbs */}
              <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hierarquia de Breadcrumbs
                </h3>
                <nav
                  aria-label="Breadcrumb de exemplo"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span className="hover:text-foreground cursor-pointer">Painel</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="hover:text-foreground cursor-pointer">Gestão CTC</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-foreground font-semibold">Professores</span>
                </nav>
              </div>

              {/* Paginação de Tabela */}
              <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Controle de Paginação
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Página 1 de 8</span>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled>
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                      Próxima
                    </Button>
                  </div>
                </div>
              </div>

              {/* Alternador de Tema Compacto */}
              <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Alternador de Tema Claro / Escuro
                </h3>
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <span className="text-xs text-muted-foreground">
                    Componente ThemeToggle integrado aos provedores `next-themes` e persistência local.
                  </span>
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Rodapé OpenDocs Padronizado */}
        <footer className="border-t border-border py-6 px-4 sm:px-6 bg-muted/20 text-xs text-muted-foreground mt-16">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Camini</span>
              <span>•</span>
              <span>Design System Studio Admin</span>
              <span>•</span>
              <span>Documentação Técnica de Componentes</span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-foreground transition-colors">
                Início
              </Link>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/ctc/calendario" className="hover:text-foreground transition-colors">
                Calendário CTC
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
