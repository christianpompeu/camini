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
    <div className="min-h-screen text-text-primary flex flex-col selection:bg-camini-cobalt/20 selection:text-camini-cobalt">
      {/* Barra de Navegação Superior da Plataforma camini */}
      <Navbar />

      <main className="flex-1">
        {/* ========================================================
            HERO SECTION: BOAS-VINDAS AO CAMINI
           ======================================================== */}
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-8 text-center">
          {/* Efeitos de profundidade e iluminação ambiente */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-camini opacity-15 rounded-full blur-[120px] pointer-events-none" />

          {/* Doodles Discretos de Fundo */}
          <div className="absolute inset-0 z-0 opacity-10 dark:opacity-5 pointer-events-none mix-blend-multiply dark:mix-blend-screen">
            <Image src="/doodle_camini_2.png" alt="Background Doodle" fill className="object-cover object-center" priority />
          </div>

          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-surface-elevated border border-outline shadow-sm animate-in fade-in duration-300">
              <span className="w-2 h-2 rounded-full bg-camini-cobalt animate-pulse" />
              <span className="text-xs font-bold text-text-secondary tracking-wide">
                Ecossistema Modular Integrado • 2026
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-text-primary leading-[1.08]">
              Bem-vindo ao{" "}
              <span className="text-transparent bg-clip-text bg-gradient-camini">camini</span>.
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-normal">
              Sua plataforma mestre para aplicações de alto rendimento pessoal,
              eclesiástico e profissional. Construída com interface conversacional moderna,
              design expressivo e velocidade instantânea.
            </p>

            {/* Ações Rápidas de Boas-Vindas */}
            <div className="pt-4 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3.5 max-w-4xl mx-auto">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="camini"
                  size="lg"
                  fullWidth
                  className="shadow-xl shadow-blue-500/25 gap-2"
                >
                  <Layers className="w-5 h-5" />
                  <span>Acessar Dashboard</span>
                </Button>
              </Link>

              <Link href="/totvs-rm" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="border-outline hover:border-camini-cyan text-text-primary gap-2"
                >
                  <Database className="w-5 h-5 text-camini-cyan" />
                  <span>RM SQL AI</span>
                </Button>
              </Link>

              <Link href="/forca" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="border-outline hover:border-camini-cobalt text-text-primary gap-2"
                >
                  <Dumbbell className="w-5 h-5 text-camini-cobalt" />
                  <span>App FORÇA</span>
                </Button>
              </Link>

              <Link href="/playground" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="border-camini-indigo/30 hover:border-camini-indigo text-text-primary gap-2"
                >
                  <Sparkles className="w-5 h-5 text-camini-indigo" />
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
                <span className="text-xs font-bold uppercase tracking-wider text-camini-cobalt block mb-1">
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
              <div className="relative overflow-hidden rounded-xl border-2 border-camini-red/50 bg-surface-elevated p-6 card-elevation flex flex-col justify-between transition-all duration-200 hover:border-camini-red hover:shadow-xl hover:shadow-camini-red/15">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-camini-red" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-camini-red/15 border border-camini-red/30 flex items-center justify-center text-red-500">
                      <Layers className="w-6 h-6" />
                    </div>
                    <Chip variant="outline" size="sm" className="font-bold text-red-500 border-camini-red/30">
                      Central
                    </Chip>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    Dashboard Central
                  </h3>
                  <span className="text-xs font-semibold text-red-500 block mt-0.5">
                    Visão Geral e Acesso Rápido
                  </span>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-3">
                    Acesse todos os módulos da plataforma, visualize métricas consolidadas e gerencie suas configurações a partir de um único lugar.
                  </p>

                  <ul className="mt-4 space-y-1.5 text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                      <span>Integração de todos os módulos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                      <span>Gestão unificada de acessos</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-outline/60">
                  <Link href="/dashboard">
                    <Button variant="secondary" size="md" fullWidth className="border-outline hover:border-camini-red">
                      <span>Acessar Dashboard</span>
                      <ArrowRight className="w-4 h-4 text-red-500" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* CARD: GESTÃO FINANCEIRA E ACADÊMICA */}
              <div className="relative overflow-hidden rounded-xl border border-outline bg-surface-elevated p-6 card-elevation flex flex-col justify-between transition-all duration-200 opacity-70 grayscale-[30%]">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-400" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500">
                      <Activity className="w-6 h-6" />
                    </div>
                    <Chip variant="outline" size="sm" className="font-bold text-gray-500 border-gray-300 dark:border-slate-600">
                      Planejado
                    </Chip>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    Gestão Integrada
                  </h3>
                  <span className="text-xs font-semibold text-gray-500 block mt-0.5">
                    Financeiro e RH
                  </span>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-3">
                    Módulos em desenvolvimento para administração eficiente. Integração com fluxo de caixa, gestão de recursos humanos e acompanhamento corporativo.
                  </p>

                  <ul className="mt-4 space-y-1.5 text-xs text-text-secondary">
                    <li className="flex items-center gap-2 text-gray-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Integração contábil</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Gestão de benefícios</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-outline/60">
                  <Button variant="secondary" size="md" fullWidth disabled className="border-outline text-gray-400 cursor-not-allowed">
                    <span>Em breve</span>
                  </Button>
                </div>
              </div>

              {/* CARD 0: TOTVS RM SQL STUDIO */}
              <div className="relative overflow-hidden rounded-xl border-2 border-camini-cobalt/50 bg-surface-elevated p-6 card-elevation flex flex-col justify-between transition-all duration-200 hover:border-camini-cobalt hover:shadow-xl hover:shadow-blue-500/15">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-camini" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-camini-cobalt/15 border border-camini-cobalt/30 flex items-center justify-center text-camini-cobalt">
                      <Database className="w-6 h-6" />
                    </div>
                    <Chip variant="camini" size="sm" className="font-bold">
                      Disponível
                    </Chip>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    RM SQL Studio
                  </h3>
                  <span className="text-xs font-semibold text-camini-cobalt block mt-0.5">
                    IA Especializada em TOTVS Corpore RM
                  </span>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-3">
                    Assistente conversacional estilo ChatGPT/Gemini com catálogo de mais de 9.400 tabelas,
                    mapeamento de campos, chaves estrangeiras e geração de scripts T-SQL de alta performance.
                  </p>

                  <ul className="mt-4 space-y-1.5 text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-camini-aqua" />
                      <span>Dicionário completo RM (Fluxus, Nucleus, Labore, etc.)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-camini-aqua" />
                      <span>RAG de relacionamentos e regras multi-coligada</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-camini-aqua" />
                      <span>Histórico de sessões e cópia em 1 clique</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-outline/60">
                  <Link href="/totvs-rm">
                    <Button variant="camini" size="md" fullWidth className="shadow-md gap-2">
                      <span>Acessar RM SQL Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* CARD 1: APP FORÇA */}
              <div className="relative overflow-hidden rounded-xl border border-outline bg-surface-elevated p-6 card-elevation flex flex-col justify-between transition-all duration-200 hover:border-camini-cobalt/60 hover:shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-camini-cobalt" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-camini-cobalt/15 border border-camini-cobalt/30 flex items-center justify-center text-camini-cobalt">
                      <Dumbbell className="w-6 h-6" />
                    </div>
                    <Chip variant="outline" size="sm" className="font-bold text-camini-cobalt border-camini-cobalt/30">
                      Disponível
                    </Chip>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    App FORÇA
                  </h3>
                  <span className="text-xs font-semibold text-camini-cobalt block mt-0.5">
                    Módulo de Treino & Alta Performance
                  </span>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-3">
                    Projetado para treinos com foco estrito. Carga progressiva, controle de
                    RIR (repetições na reserva), métricas gigantes de alta visibilidade e
                    cronômetro de descanso integrado.
                  </p>

                  <ul className="mt-4 space-y-1.5 text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-camini-aqua" />
                      <span>Active Set Card em tempo real</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-camini-aqua" />
                      <span>Escala de esforço de RIR 0 a 3</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-camini-aqua" />
                      <span>Rotinas estruturadas A/B/C/D</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-outline/60">
                  <Link href="/forca">
                    <Button variant="camini" size="md" fullWidth className="shadow-md">
                      <span>Acessar App FORÇA</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* CARD 2: DESIGN SYSTEM PLAYGROUND */}
              <div className="relative overflow-hidden rounded-xl border border-outline bg-surface-elevated p-6 card-elevation flex flex-col justify-between transition-all duration-200 hover:border-camini-indigo/50 hover:shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-camini-indigo" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-camini-indigo/15 border border-camini-indigo/30 flex items-center justify-center text-camini-indigo">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <Chip variant="outline" size="sm" className="font-semibold text-camini-indigo border-camini-indigo/30">
                      Ambiente Vivo
                    </Chip>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    Design System Playground
                  </h3>
                  <span className="text-xs font-semibold text-camini-indigo block mt-0.5">
                    Tokens, Componentes & Estilo
                  </span>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-3">
                    Espaço interativo de validação da identidade visual inspirada em
                    Material 3 Expressive. Paleta semântica no Tailwind CSS v4, gradientes,
                    escala Geist e superfícies glassmorphism.
                  </p>

                  <ul className="mt-4 space-y-1.5 text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-camini-indigo" />
                      <span>Tokens semânticos e modo escuro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-camini-indigo" />
                      <span>Micro-motion físico e botões táteis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-camini-indigo" />
                      <span>Componentes de treino em playground</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-outline/60">
                  <Link href="/playground">
                    <Button variant="secondary" size="md" fullWidth className="border-outline hover:border-camini-indigo">
                      <span>Explorar Playground</span>
                      <ArrowRight className="w-4 h-4 text-camini-indigo" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* CARD 3: EXPANSÃO FUTURA (ROADMAP) */}
              <div className="relative overflow-hidden rounded-xl border border-outline/60 bg-surface-elevated/50 p-6 flex flex-col justify-between opacity-85">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-surface border border-outline flex items-center justify-center text-text-secondary">
                      <HeartPulse className="w-6 h-6 text-red-500" />
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
              <span className="text-xs font-bold uppercase tracking-wider text-camini-aqua">
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
                <div className="w-10 h-10 rounded-pill bg-camini-cobalt/15 text-camini-cobalt flex items-center justify-center font-bold">
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
                <div className="w-10 h-10 rounded-pill bg-camini-aqua/15 text-camini-aqua flex items-center justify-center font-bold">
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
                <div className="w-10 h-10 rounded-pill bg-camini-indigo/15 text-camini-indigo flex items-center justify-center font-bold">
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
          <div className="flex items-center gap-3">
            <div className="relative w-36 sm:w-44 h-9 sm:h-10">
              <Image 
                src="/logo_camini_light.png" 
                alt="Camini Logo Light" 
                fill 
                className="object-contain object-left camini-logo-light dark:hidden" 
              />
              <Image 
                src="/logo_camini_dark.png" 
                alt="Camini Logo Dark" 
                fill 
                className="object-contain object-left camini-logo-dark hidden dark:block" 
              />
            </div>
            <span className="font-extrabold text-text-primary tracking-tight">
              © 2026
            </span>
            <span>•</span>
            <span>Ecossistema Integrado de Alta Performance</span>
          </div>

          <div className="flex items-center gap-4 font-semibold">
            <Link href="/" className="hover:text-text-primary transition-colors">
              Início
            </Link>
            <Link href="/dashboard" className="hover:text-red-500 transition-colors">
              Dashboard
            </Link>
            <Link href="/playground" className="hover:text-camini-indigo transition-colors">
              Design System Playground
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
