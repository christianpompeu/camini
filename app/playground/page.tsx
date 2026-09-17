"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Sparkles,
  Shield,
  Activity,
  Layers,
  Palette,
  Type,
  Maximize2,
  Bell,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Dumbbell,
  Timer,
  Eye,
  Sliders,
  Home,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBanner } from "@/components/ui/status-banner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import { WorkoutCard } from "@/components/workout/workout-card";
import { ActiveSetCard } from "@/components/workout/active-set-card";
import { RestTimer } from "@/components/workout/rest-timer";
import { FloatingWorkoutBar } from "@/components/workout/floating-workout-bar";
import { BottomNavigation } from "@/components/workout/bottom-navigation";
import { ExerciseHero } from "@/components/workout/exercise-hero";
import { Navbar } from "@/components/layout/navbar";

export default function DesignSystemPlaygroundPage() {
  const [activeTab, setActiveTab] = useState<"todos" | "tokens" | "ui" | "treino">("todos");
  const [sampleInput, setSampleInput] = useState("80");
  const [sampleError, setSampleError] = useState("");
  const [showSuccessBanner, setShowSuccessBanner] = useState(true);
  const [showWarningBanner, setShowWarningBanner] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(true);
  const [lastWorkoutLog, setLastWorkoutLog] = useState<string | null>(null);

  const expressiveColors = [
    { name: "Energy Blue", var: "--energy-blue", hex: "#5B7CFA", role: "Ação primária, foco, cronômetro", bgClass: "bg-energy-blue" },
    { name: "Energy Cyan", var: "--energy-cyan", hex: "#41C7D9", role: "Movimento, fluxo, oxigenação", bgClass: "bg-energy-cyan" },
    { name: "Energy Violet", var: "--energy-violet", hex: "#9A6CFF", role: "Intensidade neural, precisão", bgClass: "bg-energy-violet" },
    { name: "Energy Coral", var: "--energy-coral", hex: "#FF706A", role: "Alerta, esgotamento, carga limite", bgClass: "bg-energy-coral" },
    { name: "Energy Amber", var: "--energy-amber", hex: "#F4B84A", role: "Atenção, descanso ativo, calor", bgClass: "bg-energy-amber" },
    { name: "Energy Green", var: "--energy-green", hex: "#52B788", role: "Conclusão, meta atingida, PR", bgClass: "bg-energy-green" },
  ];

  const neutralsLight = [
    { name: "Surface", hex: "#F8F9FC", role: "Fundo de tela light" },
    { name: "Surface Elevated", hex: "rgba(255,255,255,.82)", role: "Cards e containers" },
    { name: "Text Primary", hex: "#171A21", role: "Títulos e métricas principais" },
    { name: "Text Secondary", hex: "#626A78", role: "Subtítulos e rótulos" },
    { name: "Outline", hex: "rgba(23,26,33,.10)", role: "Divisores e bordas" },
  ];

  const radiusTokens = [
    { name: "--radius-sm", value: "12px", usage: "Badges pequenos, botões compactos" },
    { name: "--radius-md", value: "18px", usage: "Inputs, botões principais, controles" },
    { name: "--radius-lg", value: "26px", usage: "Cards padrão, banners, hero" },
    { name: "--radius-xl", value: "34px", usage: "Containers grandes, bottom bar" },
    { name: "--radius-pill", value: "999px", usage: "Chips, tabs, tags e contadores" },
  ];

  return (
    <div className="min-h-screen bg-surface text-text-primary pb-32">
      {/* Barra de Navegação Superior Padronizada camini */}
      <Navbar />

      {/* Sub-barra de Contexto e Filtros de Abas do Playground */}
      <div className="bg-surface-elevated/80 border-b border-outline/50 px-4 sm:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Link href="/" className="hover:text-text-primary transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>camini Hub</span>
            </Link>
            <span>/</span>
            <span className="font-bold text-energy-violet">Design System Playground</span>
          </div>

          {/* Abas de Navegação de Tokens / Seções */}
          <div className="flex items-center bg-surface border border-outline rounded-pill p-1 self-start sm:self-auto overflow-x-auto">
            {(["todos", "tokens", "ui", "treino"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-pill text-xs font-semibold capitalize transition-all tap-effect ${
                  activeTab === tab
                    ? "bg-gradient-energy text-white shadow-sm font-bold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero do Playground */}
      <section className="px-4 sm:px-8 max-w-6xl mx-auto pt-8 pb-6">
        <div className="relative overflow-hidden rounded-xl border border-outline bg-surface-elevated p-6 sm:p-10 card-elevation">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-energy opacity-10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 max-w-2xl">
            <Chip variant="energy" size="sm" className="mb-3">
              Identidade Visual Contemporânea
            </Chip>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
              Design System <span className="text-gradient-energy">FORÇA</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-text-secondary leading-relaxed">
              Linguagem visual inspirada nos princípios modernos de <strong>Material 3 Expressive</strong>:
              força, energia, clareza, disciplina e progresso. Desenvolvida sob demanda para interfaces táteis,
              mobile-first, com contraste WCAG AA e foco absoluto na leitura imediata em treinos de alta performance.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Chip variant="outline" size="sm">Mobile-first</Chip>
              <Chip variant="outline" size="sm">WCAG AA Contrast</Chip>
              <Chip variant="outline" size="sm">Tailwind CSS v4</Chip>
              <Chip variant="outline" size="sm">Geist Typography</Chip>
              <Chip variant="outline" size="sm">Glassmorphism Moderado</Chip>
              <Chip variant="outline" size="sm">Touch Targets ≥ 44px</Chip>
            </div>
          </div>
        </div>
      </section>

      {/* Navegação Mobile de Abas */}
      <div className="md:hidden px-4 mb-6">
        <div className="flex items-center justify-between bg-surface-elevated border border-outline rounded-pill p-1 overflow-x-auto">
          {(["todos", "tokens", "ui", "treino"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[70px] py-2 px-2 rounded-pill text-xs font-semibold capitalize text-center transition-all tap-effect ${
                activeTab === tab
                  ? "bg-gradient-energy text-white shadow-sm"
                  : "text-text-secondary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        {/* ========================================================
            SEÇÃO 1: TOKENS DE COR, GRADIENTES & SUPERFÍCIES
           ======================================================== */}
        {(activeTab === "todos" || activeTab === "tokens") && (
          <section className="space-y-8 animate-in fade-in duration-300">
            <div>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-energy-blue" />
                <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                  1. Paleta de Cores e Tokens Semânticos
                </h2>
              </div>
              <p className="text-sm text-text-secondary mt-1">
                Definidos como tokens semânticos no Tailwind CSS v4, garantindo coerência sem repetição de hexadecimais arbitrários.
              </p>
            </div>

            {/* Cores Expressivas */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">
                Cores Expressivas
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {expressiveColors.map((color) => (
                  <div
                    key={color.name}
                    className="p-3.5 rounded-lg bg-surface-elevated border border-outline card-elevation flex flex-col justify-between h-36"
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-8 h-8 rounded-pill ${color.bgClass} shadow-md`} />
                      <span className="font-mono text-[11px] font-bold text-text-secondary">
                        {color.hex}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text-primary block">
                        {color.name}
                      </span>
                      <span className="text-[11px] text-text-secondary leading-tight line-clamp-2 mt-0.5">
                        {color.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gradientes Expressivos */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">
                Gradientes Funcionais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Energy */}
                <div className="p-5 rounded-lg bg-surface-elevated border border-outline card-elevation space-y-3">
                  <div className="h-16 rounded-md bg-gradient-energy flex items-center justify-center text-white font-bold text-sm shadow-md">
                    --gradient-energy
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">
                      Gradiente Principal de Energia
                    </h4>
                    <p className="text-xs text-text-secondary mt-1">
                      Usado em indicadores de progresso, heros, CTA principal e evolução de treino.
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="p-5 rounded-lg bg-surface-elevated border border-outline card-elevation space-y-3">
                  <div className="h-16 rounded-md bg-gradient-progress flex items-center justify-center text-white font-bold text-sm shadow-md">
                    --gradient-progress
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">
                      Progresso e Conclusão
                    </h4>
                    <p className="text-xs text-text-secondary mt-1">
                      Transição suave do azul para o ciano e verde, simbolizando metas atingidas.
                    </p>
                  </div>
                </div>

                {/* Effort */}
                <div className="p-5 rounded-lg bg-surface-elevated border border-outline card-elevation space-y-3">
                  <div className="h-16 rounded-md bg-gradient-effort flex items-center justify-center text-white font-bold text-sm shadow-md">
                    --gradient-effort
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">
                      Esforço e Intensidade (RIR)
                    </h4>
                    <p className="text-xs text-text-secondary mt-1">
                      Do âmbar ao coral e violeta para registrar séries no limite e esforço máximo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Glassmorphism e Superfícies */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">
                Superfícies Glassmorphism & Profundidade
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative p-6 rounded-xl overflow-hidden border border-outline bg-gradient-to-r from-energy-blue/10 via-energy-violet/10 to-energy-coral/10">
                  <div className="glass-surface p-5 rounded-lg space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-energy-blue">
                      Glass Surface Moderada
                    </span>
                    <p className="text-sm font-semibold text-text-primary">
                      Fundo translúcido (72%) com blur de 18px e saturação 140%.
                    </p>
                    <p className="text-xs text-text-secondary">
                      Destinada para barras flutuantes, bottom navigation e modais rápidos.
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-outline bg-surface-elevated card-elevation flex flex-col justify-center space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-energy-green">
                    Card Elevation Sólida
                  </span>
                  <p className="text-sm font-semibold text-text-primary">
                    Superfície elevada com sombra calculada para modos claro e escuro.
                  </p>
                  <p className="text-xs text-text-secondary">
                    Garante legibilidade alta sem poluição visual em formulários e listas densas.
                  </p>
                </div>
              </div>
            </div>

            {/* Border Radius Tokens */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">
                Tokens de Border Radius (Cantos Generosamente Arredondados)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {radiusTokens.map((r) => (
                  <div
                    key={r.name}
                    className="p-3 rounded-md bg-surface-elevated border border-outline flex flex-col items-center text-center justify-center gap-1"
                  >
                    <span className="font-mono text-xs font-bold text-energy-blue">
                      {r.name}
                    </span>
                    <span className="text-sm font-extrabold text-text-primary">
                      {r.value}
                    </span>
                    <span className="text-[10px] text-text-secondary line-clamp-1">
                      {r.usage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            SEÇÃO 2: TIPOGRAFIA & HIERARQUIA VISUAL
           ======================================================== */}
        {(activeTab === "todos" || activeTab === "tokens") && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <div>
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-energy-cyan" />
                <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                  2. Tipografia e Escala de Leitura (Geist)
                </h2>
              </div>
              <p className="text-sm text-text-secondary mt-1">
                Tipografia limpa, geométrica e de alto contraste. No modo treino, métricas numéricas ganham peso e escala dominante.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface-elevated border border-outline card-elevation space-y-6">
              {/* Display */}
              <div className="border-b border-outline/50 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-energy-blue">
                  Display (44–56 px)
                </span>
                <p className="text-4xl sm:text-5xl font-black text-text-primary tracking-tight mt-1">
                  SUPERAÇÃO DIÁRIA
                </p>
              </div>

              {/* H1 */}
              <div className="border-b border-outline/50 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-energy-cyan">
                  H1 (32–40 px)
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mt-1">
                  Treino A • Peitoral e Tríceps
                </h1>
              </div>

              {/* H2 */}
              <div className="border-b border-outline/50 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-energy-violet">
                  H2 (24–30 px)
                </span>
                <h2 className="text-2xl font-bold text-text-primary tracking-tight mt-1">
                  Supino Reto com Barra Olímpica
                </h2>
              </div>

              {/* Body */}
              <div className="border-b border-outline/50 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Body (16–18 px)
                </span>
                <p className="text-base text-text-primary leading-relaxed mt-1">
                  Mantenha a contração constante no topo sem hiperestender os cotovelos. Inspire na descida de 3 segundos e expire com força na subida explosiva.
                </p>
              </div>

              {/* Labels */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Labels & Tags (13–15 px)
                </span>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-semibold text-text-secondary">
                    TEMPO DE DESCANSO: 90 SEG
                  </span>
                  <span className="text-sm font-bold text-energy-green">
                    +4.5% EM RELAÇÃO À ÚLTIMA SEMANA
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            SEÇÃO 3: COMPONENTES FUNDAMENTAIS DE UI
           ======================================================== */}
        {(activeTab === "todos" || activeTab === "ui") && (
          <section className="space-y-8 animate-in fade-in duration-300">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-energy-violet" />
                <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                  3. Componentes Fundamentais
                </h2>
              </div>
              <p className="text-sm text-text-secondary mt-1">
                Alvos de toque ergonômicos (≥ 44px), micro-interações táteis (`active:scale-[0.97]`) e estados de foco acessíveis.
              </p>
            </div>

            {/* Botões */}
            <div className="p-6 rounded-xl bg-surface-elevated border border-outline card-elevation space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                Botões e Ações
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="energy" size="md">
                  <Zap className="w-4 h-4" />
                  Botão Energia (CTA)
                </Button>

                <Button variant="secondary" size="md">
                  Botão Secundário
                </Button>

                <Button variant="outline" size="md">
                  Botão Outline
                </Button>

                <Button variant="effort" size="md">
                  <Flame className="w-4 h-4" />
                  Botão Esforço
                </Button>

                <Button variant="ghost" size="md">
                  Ghost Button
                </Button>

                <Button variant="coral" size="md">
                  Ação Crítica
                </Button>
              </div>

              <div className="pt-2 text-xs text-text-secondary flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-energy-amber" />
                <span>Pressione os botões para testar a resposta tátil de escala física (`tap-effect`).</span>
              </div>
            </div>

            {/* Chips e Badges */}
            <div className="p-6 rounded-xl bg-surface-elevated border border-outline card-elevation space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                Chips e Pílulas de Estado
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <Chip variant="default" interactive>Padrão</Chip>
                <Chip variant="active" interactive>Ativo</Chip>
                <Chip variant="energy" interactive>Energia M3</Chip>
                <Chip variant="success" interactive>Sucesso / Concluído</Chip>
                <Chip variant="warning" interactive>Atenção / Limite</Chip>
                <Chip variant="outline" interactive>Outline Interativo</Chip>
              </div>
            </div>

            {/* Formulários & Inputs */}
            <div className="p-6 rounded-xl bg-surface-elevated border border-outline card-elevation space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                Inputs e Controles de Formulário
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Carga Atual (kg)"
                  value={sampleInput}
                  onChange={(e) => {
                    setSampleInput(e.target.value);
                    if (Number(e.target.value) > 200) {
                      setSampleError("Verifique a carga acima de 200kg");
                    } else {
                      setSampleError("");
                    }
                  }}
                  helperText="Insira a carga total em halteres ou anilhas"
                />

                <Input
                  label="Repetições Estimadas"
                  defaultValue="10"
                  helperText="Intervalo sugerido de 8 a 12 reps"
                />

                <Input
                  label="Validação com Erro"
                  defaultValue="Carga Inválida"
                  error="Formato numérico obrigatório"
                />
              </div>
            </div>

            {/* Estados de Notificação / Feedback */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                  Banners de Estado (Sucesso, Atenção e Offline)
                </h3>
                {( !showSuccessBanner || !showWarningBanner || !showOfflineBanner ) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowSuccessBanner(true);
                      setShowWarningBanner(true);
                      setShowOfflineBanner(true);
                    }}
                  >
                    Restaurar Banners
                  </Button>
                )}
              </div>

              {showSuccessBanner && (
                <StatusBanner
                  status="success"
                  title="Série Registrada com Sucesso!"
                  description="Carga de 34 kg registrada na nuvem. Seu novo recorde pessoal foi atualizado."
                  onClose={() => setShowSuccessBanner(false)}
                />
              )}

              {showWarningBanner && (
                <StatusBanner
                  status="warning"
                  title="Atenção à Recuperação Muscular"
                  description="Você treinou Peitoral há menos de 48h. Considere monitorar a escala de fadiga (RIR)."
                  onClose={() => setShowWarningBanner(false)}
                />
              )}

              {showOfflineBanner && (
                <StatusBanner
                  status="offline"
                  title="Modo Offline Ativado"
                  description="Suas séries serão armazenadas localmente no dispositivo e sincronizadas ao reconectar."
                  onClose={() => setShowOfflineBanner(false)}
                />
              )}
            </div>
          </section>
        )}

        {/* ========================================================
            SEÇÃO 4: COMPONENTES DE DOMÍNIO DE TREINO
           ======================================================== */}
        {(activeTab === "todos" || activeTab === "treino") && (
          <section className="space-y-8 animate-in fade-in duration-300">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-energy-green" />
                <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                  4. Experiência de Treino & Domínio FORÇA
                </h2>
              </div>
              <p className="text-sm text-text-secondary mt-1">
                Componentes centrais que o usuário utilizará diretamente durante a execução dos exercícios na academia.
              </p>
            </div>

            {/* Grid de Treino: Workout Card + Active Set Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Workout Card */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block">
                  Workout Card (Visão de Treino Diário)
                </span>
                <WorkoutCard
                  letter="A"
                  title="Peito, Ombros e Tríceps"
                  focus="Foco em Hipertrofia & Força Estrita"
                  exerciseCount={6}
                  lastExecuted="Ontem, 19:30"
                  estimatedMinutes={50}
                  onStart={() => alert("Iniciando Treino A!")}
                />
              </div>

              {/* Active Set Card */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-energy-blue block">
                  Active Set Card (Elemento Dominante em Execução)
                </span>
                <ActiveSetCard
                  exerciseName="Supino Inclinado com Halteres"
                  targetMuscles="Peitoral Superior e Tríceps"
                  currentSet={2}
                  totalSets={4}
                  initialWeight={32}
                  initialReps={8}
                  initialRir={2}
                  onCompleteSet={(data) => {
                    setLastWorkoutLog(
                      `Série concluída: ${data.weight}kg x ${data.reps} reps (RIR ${data.rir})`
                    );
                  }}
                />
                {lastWorkoutLog && (
                  <div className="p-3 rounded-md bg-energy-green/10 border border-energy-green/30 text-energy-green text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lastWorkoutLog}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cronômetro de Descanso + Exercise Hero */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Rest Timer */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block">
                  Rest Timer (Progress Ring Circular SVG Fluido)
                </span>
                <RestTimer
                  initialSeconds={90}
                  onFinish={() => alert("Descanso finalizado! Hora da próxima série.")}
                />
              </div>

              {/* Exercise Hero */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block">
                  Exercise Hero (Legibilidade com Gradiente Protetor)
                </span>
                <ExerciseHero
                  name="Desenvolvimento Militar com Halteres"
                  category="Deltoides & Trapézio"
                  muscles={["Deltoide Anterior", "Deltoide Lateral", "Tríceps"]}
                  sets="4 Séries"
                  reps="8 a 12 Repetições"
                  cues={[
                    "Posicione o banco em 75° a 80° para conforto articular.",
                    "Pés firmes no chão gerando leg drive moderado.",
                    "Desça os halteres até a linha das orelhas mantendo cotovelos a 45°.",
                  ]}
                />
              </div>
            </div>

            {/* Telemetria Flutuante e Navegação */}
            <div className="space-y-4 pt-4 border-t border-outline/50">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                Superfícies Flutuantes (Glassmorphism de Alta Performance)
              </h3>

              <div className="p-6 rounded-xl bg-surface-elevated border border-outline card-elevation flex flex-col items-center justify-center gap-6">
                <div className="w-full flex flex-col items-center">
                  <span className="text-xs font-bold text-text-secondary mb-2">
                    Floating Workout Bar (Barra Flutuante Durante o Treino)
                  </span>
                  <FloatingWorkoutBar
                    currentExercise="Supino Inclinado com Halteres"
                    currentSet="Série 2 de 4"
                    timerFormatted="01:14"
                    onNextAction={() => alert("Avançando para Série 3...")}
                  />
                </div>

                <div className="w-full flex flex-col items-center">
                  <span className="text-xs font-bold text-text-secondary mb-2">
                    Bottom Navigation (Navegação Principal com Indicador Pill)
                  </span>
                  <BottomNavigation />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Barra de Rodapé Flutuante Fixo para Demonstração Mobile */}
      <div className="fixed bottom-4 inset-x-0 px-4 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNavigation />
        </div>
      </div>
    </div>
  );
}
