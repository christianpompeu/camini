"use client";

import React from "react";
import Link from "next/link";
import {
  Play,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Flame,
  Clock,
  TrendingUp,
  Activity,
  ArrowLeft,
  Dumbbell,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { WorkoutCard } from "@/components/workout/workout-card";
import { ActiveSetCard } from "@/components/workout/active-set-card";
import { BottomNavigation } from "@/components/workout/bottom-navigation";

export default function ForcaAppPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary flex flex-col selection:bg-energy-blue/20 selection:text-energy-blue">
      {/* Barra de Navegação Superior */}
      <Navbar />

      <main className="flex-1">
        {/* Banner de Contexto de Módulo (camini > FORÇA) */}
        <div className="bg-surface-elevated/80 border-b border-outline/50 px-4 sm:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-text-secondary">
              <Link href="/" className="hover:text-text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>camini Hub</span>
              </Link>
              <span>/</span>
              <span className="font-bold text-energy-blue">App FORÇA</span>
            </div>
            <Chip variant="energy" size="sm" className="text-[10px] py-0.5 px-2">
              Módulo de Treino Ativo
            </Chip>
          </div>
        </div>

        {/* ========================================================
            HERO SECTION DO APP FORÇA
           ======================================================== */}
        <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-8">
          {/* Efeitos de iluminação sutil de fundo */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-gradient-energy opacity-15 rounded-full blur-[110px] pointer-events-none" />

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Coluna de Apresentação do Módulo */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-surface-elevated border border-outline shadow-sm">
                  <Dumbbell className="w-4 h-4 text-energy-blue" />
                  <span className="text-xs font-bold text-text-secondary tracking-wide">
                    FORÇA • Módulo de Alta Performance
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-text-primary leading-[1.1]">
                  A força que transforma sua disciplina em{" "}
                  <span className="text-gradient-energy block sm:inline">
                    evolução constante.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Projetado para eliminar atritos na academia. Registre sobrecargas progressivas,
                  séries de trabalho e repetições na reserva (RIR) com visibilidade imediata
                  mesmo em esforço máximo.
                </p>

                {/* CTAs de Ação */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                  <Link href="#treinos" className="w-full sm:w-auto">
                    <Button
                      variant="energy"
                      size="lg"
                      fullWidth
                      className="shadow-xl shadow-energy-blue/25"
                    >
                      <Play className="w-5 h-5 fill-white" />
                      Iniciar Treino do Dia
                    </Button>
                  </Link>

                  <Link href="/playground" className="w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="lg"
                      fullWidth
                      className="border-energy-violet/30 hover:border-energy-violet text-text-primary"
                    >
                      <Sparkles className="w-5 h-5 text-energy-violet" />
                      Ver Design System
                    </Button>
                  </Link>
                </div>

                {/* Badges de Confiança */}
                <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-energy-green" />
                    <span>Controle de RIR (0 a 3)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-energy-blue" />
                    <span>Métricas Gigantes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-energy-violet" />
                    <span>Descanso Fluido</span>
                  </div>
                </div>
              </div>

              {/* Coluna Visual: Active Set Card em Destaque */}
              <div className="lg:col-span-5 relative">
                {/* Cartão Flutuante de Sobrecarga */}
                <div className="absolute -top-5 -left-4 z-20 hidden sm:flex items-center gap-3 p-3 rounded-xl glass-surface card-elevation shadow-lg animate-in fade-in slide-in-from-top-4">
                  <div className="w-9 h-9 rounded-pill bg-energy-green/20 flex items-center justify-center text-energy-green">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                      Sobrecarga Progressiva
                    </span>
                    <span className="text-xs font-extrabold text-energy-green">
                      +4 kg nesta semana
                    </span>
                  </div>
                </div>

                {/* Active Set Card Interativo */}
                <div className="relative z-10">
                  <ActiveSetCard
                    exerciseName="Supino Inclinado com Halteres"
                    targetMuscles="Peitoral Superior & Deltoides"
                    currentSet={2}
                    totalSets={4}
                    initialWeight={34}
                    initialReps={8}
                    initialRir={1}
                    className="border-energy-blue/30 shadow-2xl"
                  />
                </div>

                {/* Cartão Flutuante de Descanso */}
                <div className="absolute -bottom-5 -right-4 z-20 hidden sm:flex items-center gap-3 p-3 rounded-xl glass-surface card-elevation shadow-lg animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-9 h-9 rounded-pill bg-energy-blue/20 flex items-center justify-center text-energy-blue">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                      Descanso Ativo
                    </span>
                    <span className="text-xs font-extrabold text-text-primary font-mono">
                      01:30 fluido
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SEÇÃO: PILARES DO TREINO FORÇA
           ======================================================== */}
        <section id="metodologia" className="py-16 px-4 sm:px-8 border-t border-outline/60 bg-surface-elevated/40">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Chip variant="energy" size="sm">
                Metodologia Científica
              </Chip>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
                Engenharia de Treino com Foco Puro
              </h2>
              <p className="text-sm sm:text-base text-text-secondary">
                Criado para eliminar distrações e permitir que cada série seja executada com foco pleno no esforço e na recuperação.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-surface-elevated border border-outline card-elevation space-y-4 flex flex-col justify-between">
                <div className="w-12 h-12 rounded-lg bg-energy-blue/15 border border-energy-blue/30 flex items-center justify-center text-energy-blue">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary tracking-tight">
                    Controle de RIR e Esforço
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-2">
                    Acompanhe as repetições em reserva de cada série. Treine no limiar ótimo de estímulo sem acumular fadiga central desnecessária.
                  </p>
                </div>
                <div className="pt-2 border-t border-outline/50 flex items-center gap-1.5 text-xs font-bold text-energy-blue">
                  <span>Esforço Inteligente</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-6 rounded-xl bg-surface-elevated border border-outline card-elevation space-y-4 flex flex-col justify-between">
                <div className="w-12 h-12 rounded-lg bg-energy-green/15 border border-energy-green/30 flex items-center justify-center text-energy-green">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary tracking-tight">
                    Métricas Gigantes na Tela
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-2">
                    Tipografia dominante para carga e repetições. Você não precisa forçar a vista para ler a tela quando estiver exausto entre séries.
                  </p>
                </div>
                <div className="pt-2 border-t border-outline/50 flex items-center gap-1.5 text-xs font-bold text-energy-green">
                  <span>Visibilidade Instantânea</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-6 rounded-xl bg-surface-elevated border border-outline card-elevation space-y-4 flex flex-col justify-between">
                <div className="w-12 h-12 rounded-lg bg-energy-violet/15 border border-energy-violet/30 flex items-center justify-center text-energy-violet">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary tracking-tight">
                    Material 3 Expressive
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-2">
                    Cantos generosamente arredondados, gradientes vibrantes para progresso e glassmorphism moderado em superfícies de apoio.
                  </p>
                </div>
                <div className="pt-2 border-t border-outline/50 flex items-center gap-1.5 text-xs font-bold text-energy-violet">
                  <span>Design Contemporâneo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SEÇÃO: DIVISÕES DE TREINO (A/B/C)
           ======================================================== */}
        <section id="treinos" className="py-16 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-energy-blue block mb-1">
                  Divisões e Foco
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">
                  Treinos do Ciclo Atual
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary max-w-sm">
                Selecione o treino do dia para iniciar o registro instantâneo de suas cargas e descanso.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <WorkoutCard
                letter="A"
                title="Peito, Ombros e Tríceps"
                focus="Hipertrofia & Força Estrita"
                exerciseCount={6}
                lastExecuted="Ontem, 19:30"
                estimatedMinutes={50}
                onStart={() => alert("Iniciando Treino A!")}
              />

              <WorkoutCard
                letter="B"
                title="Costas e Bíceps"
                focus="Densidade Dorsal & Pull"
                exerciseCount={6}
                lastExecuted="Há 3 dias"
                estimatedMinutes={55}
                onStart={() => alert("Iniciando Treino B!")}
              />

              <WorkoutCard
                letter="C"
                title="Pernas Completo"
                focus="Quadríceps, Isquiotibiais & Panturrilhas"
                exerciseCount={7}
                lastExecuted="Há 5 dias"
                estimatedMinutes={60}
                onStart={() => alert("Iniciando Treino C!")}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé do App FORÇA */}
      <footer className="border-t border-outline py-8 px-4 sm:px-8 bg-surface-elevated/60 text-xs text-text-secondary">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-text-primary tracking-tight">
              App FORÇA
            </span>
            <span>•</span>
            <span>Módulo de Treino do ecossistema camini</span>
          </div>

          <div className="flex items-center gap-4 font-semibold">
            <Link href="/" className="hover:text-text-primary transition-colors">
              camini Hub
            </Link>
            <Link href="#treinos" className="hover:text-text-primary transition-colors">
              Treinos
            </Link>
            <Link href="/playground" className="hover:text-energy-blue transition-colors">
              Design System Playground
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
