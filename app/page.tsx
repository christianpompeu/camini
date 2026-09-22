"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Dumbbell,
  ArrowRight,
  Shield,
  Zap,
  Activity,
  Layers,
  HeartPulse,
  CheckCircle2,
  Lock,
  Database,
  Bot,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

export default function CaminiHomePage() {
  return (
    <div className="min-h-screen text-text-primary flex flex-col selection:bg-energy-blue/20 selection:text-energy-blue">
      {/* Barra de Navegação Superior da Plataforma camini */}
      <Navbar />

      <main className="flex-1">
        {/* ========================================================
            HERO SECTION: BOAS-VINDAS AO CAMINI
           ======================================================== */}
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-8 text-center">
          {/* Efeitos de profundidade e iluminação ambiente */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-energy opacity-15 rounded-full blur-[120px] pointer-events-none" />

          {/* Doodles Discretos de Fundo */}
          <div className="absolute inset-0 z-0 opacity-10 dark:opacity-5 pointer-events-none mix-blend-multiply dark:mix-blend-screen">
            <Image src="/doodle_camini_2.png" alt="Background Doodle" fill className="object-cover object-center" priority />
          </div>

          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-surface-elevated border border-outline shadow-sm animate-in fade-in duration-300">
              <span className="w-2 h-2 rounded-full bg-energy-blue animate-pulse" />
              <span className="text-xs font-bold text-text-secondary tracking-wide">
                Ecossistema Modular Integrado • 2026
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-text-primary leading-[1.08]">
              Bem-vindo ao{" "}
              <span className="text-gradient-energy">camini</span>.
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-normal">
              Sua plataforma mestre para aplicações de alto rendimento pessoal,
              eclesiástico e profissional. Construída com interface conversacional moderna,
              design expressivo e velocidade instantânea.
            </p>

            {/* Ações Rápidas de Boas-Vindas */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="energy"
                  size="lg"
                  fullWidth
                  className="shadow-xl shadow-energy-blue/25 gap-2"
                >
                  <Database className="w-5 h-5 fill-white" />
                  <span>Acessar Dashboard</span>
                </Button>
              </Link>

              <Link href="/forca" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="border-outline hover:border-energy-blue text-text-primary gap-2"
                >
                  <Dumbbell className="w-5 h-5 text-energy-blue" />
                  <span>App FORÇA</span>
                </Button>
              </Link>

              <Link href="/playground" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="border-energy-violet/30 hover:border-energy-violet text-text-primary gap-2"
                >
                  <Sparkles className="w-5 h-5 text-energy-violet" />
                  <span>Design System</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            SEÇÃO: CARDS DE APLICAÇÕES E MÓDULOS
           ======================================================== */}
        <section className="py-12 sm:py-16 px-4 sm:px-8 border-t border-outline/60 bg-surface-elevated/30 dark:bg-gradient-to-b dark:from-surface-elevated/10 dark:to-transparent">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-energy-blue block mb-1">
                  Módulos do Ecossistema
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                  Aplicações Integradas
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary max-w-sm">
                Conheça os módulos ativos e as expansões planejadas para o camini.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* CARD: DASHBOARD CAMINI */}
              <div className="relative overflow-hidden rounded-xl border-2 border-energy-coral/50 bg-surface-elevated p-6 card-elevation flex flex-col justify-between transition-all duration-200 hover:border-energy-coral hover:shadow-xl hover:shadow-energy-coral/15">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-energy-coral" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-energy-coral/15 border border-energy-coral/30 flex items-center justify-center text-energy-coral">
                      <Layers className="w-6 h-6" />
                    </div>
                    <Chip variant="outline" size="sm" className="font-bold text-energy-coral border-energy-coral/30">
                      Central
                    </Chip>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    Dashboard Central
                  </h3>
                  <span className="text-xs font-semibold text-energy-coral block mt-0.5">
                    Visão Geral e Acesso Rápido
                  </span>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-3">
                    Acesse todos os módulos da plataforma, visualize métricas consolidadas e gerencie suas configurações a partir de um único lugar.
                  </p>

                  <ul className="mt-4 space-y-1.5 text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-energy-coral" />
                      <span>Integração de todos os módulos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-energy-coral" />
                      <span>Gestão unificada de acessos</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-outline/60">
                  <Link href="/dashboard">
                    <Button variant="secondary" size="md" fullWidth className="border-outline hover:border-energy-coral">
                      <span>Acessar Dashboard</span>
                      <ArrowRight className="w-4 h-4 text-energy-coral" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* CARD: GESTÃO FINANCEIRA E ACADÊMICA */}
              <div className="relative overflow-hidden rounded-xl border border-outline bg-surface-elevated p-6 card-elevation flex flex-col justify-between transition-all duration-200 hover:border-energy-amber/50 hover:shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-energy-amber" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-energy-amber/15 border border-energy-amber/30 flex items-center justify-center text-energy-amber">
                      <Activity className="w-6 h-6" />
                    </div>
                    <Chip variant="outline" size="sm" className="font-bold text-energy-amber border-energy-amber/30">
                      Disponível
                    </Chip>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    Gestão Integrada
                  </h3>
                  <span className="text-xs font-semibold text-energy-amber block mt-0.5">
                    Financeiro e Acadêmico
                  </span>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-3">
                    Soluções completas para a administração eficiente. Controle de finanças, mensalidades, gestão de turmas e acompanhamento acadêmico.
                  </p>

                  <ul className="mt-4 space-y-1.5 text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-energy-amber" />
                      <span>Fluxo de caixa e conciliação bancária</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-energy-amber" />
                      <span>Diário de classe e boletins</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-outline/60">
                  <Link href="/dashboard/gestao">
                    <Button variant="secondary" size="md" fullWidth className="border-outline hover:border-energy-amber">
                      <span>Acessar Módulos</span>
                      <ArrowRight className="w-4 h-4 text-energy-amber" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* CARD 0: TOTVS RM SQL STUDIO */}
              <div className="relative overflow-hidden rounded-xl border-2 border-energy-blue/50 bg-surface-elevated p-6 card-elevation flex flex-col justify-between transition-all duration-200 hover:border-energy-blue hover:shadow-xl hover:shadow-energy-blue/15">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-energy" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-energy-blue/15 border border-energy-blue/30 flex items-center justify-center text-energy-blue">
                      <Database className="w-6 h-6" />
                    </div>
                    <Chip variant="energy" size="sm" className="font-bold">
                      Disponível
                    </Chip>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    RM SQL Studio
                  </h3>
                  <span className="text-xs font-semibold text-energy-blue block mt-0.5">
                    IA Especializada em TOTVS Corpore RM
                  </span>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-3">
                    Assistente conversacional estilo ChatGPT/Gemini com catálogo de mais de 9.400 tabelas,
                    mapeamento de campos, chaves estrangeiras e geração de scripts T-SQL de alta performance.
                  </p>

                  <ul className="mt-4 space-y-1.5 text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-energy-green" />
                      <span>Dicionário completo RM (Fluxus, Nucleus, Labore, etc.)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-energy-green" />
                      <span>RAG de relacionamentos e regras multi-coligada</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-energy-green" />
                      <span>Histórico de sessões e cópia em 1 clique</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-outline/60">
                  <Link href="/totvs-rm">
                    <Button variant="energy" size="md" fullWidth className="shadow-md gap-2">
                      <span>Acessar RM SQL Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* CARD 1: APP FORÇA */}
              <div className="relative overflow-hidden rounded-xl border border-outline bg-surface-elevated p-6 card-elevation flex flex-col justify-between transition-all duration-200 hover:border-energy-blue/60 hover:shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-energy-blue" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-energy-blue/15 border border-energy-blue/30 flex items-center justify-center text-energy-blue">
                      <Dumbbell className="w-6 h-6" />
                    </div>
                    <Chip variant="outline" size="sm" className="font-bold text-energy-blue border-energy-blue/30">
                      Disponível
                    </Chip>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    App FORÇA
                  </h3>
                  <span className="text-xs font-semibold text-energy-blue block mt-0.5">
                    Módulo de Treino & Alta Performance
                  </span>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-3">
                    Projetado para treinos com foco estrito. Carga progressiva, controle de
                    RIR (repetições na reserva), métricas gigantes de alta visibilidade e
                    cronômetro de descanso integrado.
                  </p>

                  <ul className="mt-4 space-y-1.5 text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-energy-green" />
                      <span>Active Set Card em tempo real</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-energy-green" />
                      <span>Escala de esforço de RIR 0 a 3</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-energy-green" />
                      <span>Rotinas estruturadas A/B/C/D</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-outline/60">
                  <Link href="/forca">
                    <Button variant="energy" size="md" fullWidth className="shadow-md">
                      <span>Acessar App FORÇA</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* CARD 2: DESIGN SYSTEM PLAYGROUND */}
              <div className="relative overflow-hidden rounded-xl border border-outline bg-surface-elevated p-6 card-elevation flex flex-col justify-between transition-all duration-200 hover:border-energy-violet/50 hover:shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-energy-violet" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-energy-violet/15 border border-energy-violet/30 flex items-center justify-center text-energy-violet">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <Chip variant="outline" size="sm" className="font-semibold text-energy-violet border-energy-violet/30">
                      Ambiente Vivo
                    </Chip>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    Design System Playground
                  </h3>
                  <span className="text-xs font-semibold text-energy-violet block mt-0.5">
                    Tokens, Componentes & Estilo
                  </span>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-3">
                    Espaço interativo de validação da identidade visual inspirada em
                    Material 3 Expressive. Paleta semântica no Tailwind CSS v4, gradientes,
                    escala Geist e superfícies glassmorphism.
                  </p>

                  <ul className="mt-4 space-y-1.5 text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-energy-violet" />
                      <span>Tokens semânticos e modo escuro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-energy-violet" />
                      <span>Micro-motion físico e botões táteis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-energy-violet" />
                      <span>Componentes de treino em playground</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-outline/60">
                  <Link href="/playground">
                    <Button variant="secondary" size="md" fullWidth className="border-outline hover:border-energy-violet">
                      <span>Explorar Playground</span>
                      <ArrowRight className="w-4 h-4 text-energy-violet" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* CARD 3: EXPANSÃO FUTURA (ROADMAP) */}
              <div className="relative overflow-hidden rounded-xl border border-outline/60 bg-surface-elevated/50 p-6 flex flex-col justify-between opacity-85">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-surface border border-outline flex items-center justify-center text-text-secondary">
                      <HeartPulse className="w-6 h-6 text-energy-coral" />
                    </div>
                    <Chip variant="default" size="sm" className="text-[11px]">
                      Em Breve
                    </Chip>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    Nutrição & Biofeedback
                  </h3>
                  <span className="text-xs font-semibold text-text-secondary block mt-0.5">
                    Expansão Modular camini
                  </span>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-3">
                    Próximo módulo planejado para conectar o gasto calórico dos treinos,
                    meta proteica e qualidade da recuperação biológica em um painel único.
                  </p>

                  <div className="mt-4 p-3 rounded-lg bg-surface border border-outline/50 text-xs text-text-secondary">
                    Integração planejada com os treinos do App FORÇA e rotinas diárias.
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-outline/60">
                  <Button variant="ghost" size="md" fullWidth disabled className="opacity-60 cursor-not-allowed">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Em Desenvolvimento</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SEÇÃO DE PILARES DO CAMINI
           ======================================================== */}
        <section className="relative overflow-hidden py-16 px-4 sm:px-8">
          {/* Doodles Discretos de Fundo (Intercalado) */}
          <div className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
            <Image src="/doodle_camini_3.png" alt="Background Doodle" fill className="object-cover object-center" />
          </div>

          <div className="max-w-6xl mx-auto space-y-12 relative z-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-energy-green">
                Arquitetura de Qualidade
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">
                O Padrão camini
              </h2>
              <p className="text-sm text-text-secondary">
                Cada componente e módulo é construído sob três pilares fundamentais de engenharia e design.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-surface-elevated border border-outline card-elevation space-y-3">
                <div className="w-10 h-10 rounded-pill bg-energy-blue/15 text-energy-blue flex items-center justify-center font-bold">
                  01
                </div>
                <h4 className="text-base font-bold text-text-primary">
                  Clareza Visual Radical
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Design sem poluição ou ruído. Elementos com contraste WCAG AA, hierarquia tipográfica precisa e cantos generosamente arredondados.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-surface-elevated border border-outline card-elevation space-y-3">
                <div className="w-10 h-10 rounded-pill bg-energy-green/15 text-energy-green flex items-center justify-center font-bold">
                  02
                </div>
                <h4 className="text-base font-bold text-text-primary">
                  Ergonomia Mobile-First
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Alvos de toque confortáveis (mínimo 44px), navegação por gaveta lateral acessível e leitura instantânea em movimento.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-surface-elevated border border-outline card-elevation space-y-3">
                <div className="w-10 h-10 rounded-pill bg-energy-violet/15 text-energy-violet flex items-center justify-center font-bold">
                  03
                </div>
                <h4 className="text-base font-bold text-text-primary">
                  Performance Contemporânea
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Next.js 16 com Turbopack, Tailwind CSS v4 com tokens semânticos e transições fluidas respeitando preferências de movimento reduzido.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================
          RODAPÉ GLOBAL CAMINI
         ======================================================== */}
      <footer className="border-t border-outline py-8 px-4 sm:px-8 bg-surface-elevated/60 text-xs text-text-secondary">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-20 h-6">
              <Image 
                src="/logo_camini_5.png" 
                alt="Camini Logo Light" 
                fill 
                className="object-contain object-left camini-logo-light dark:hidden" 
              />
              <Image 
                src="/logo_camini_2.png" 
                alt="Camini Logo Dark" 
                fill 
                className="object-contain object-left camini-logo-dark hidden dark:block" 
              />
            </div>
            <span className="font-extrabold text-text-primary tracking-tight ml-1">
              © 2026
            </span>
            <span>•</span>
            <span>Ecossistema Integrado de Alta Performance</span>
          </div>

          <div className="flex items-center gap-4 font-semibold">
            <Link href="/" className="hover:text-text-primary transition-colors">
              Início
            </Link>
            <Link href="/dashboard" className="hover:text-energy-coral transition-colors">
              Dashboard
            </Link>
            <Link href="/playground" className="hover:text-energy-violet transition-colors">
              Design System Playground
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
