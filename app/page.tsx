"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Database, Dumbbell, LayoutGrid, CalendarDays, Palette, Radio, Compass, Cpu, Sparkles, Layers, ShoppingCart } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CaminiLogo } from "@/components/ui/camini-logo";

export default function CaminiHomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION - OpenDocs Style */}
        <section className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-6 py-20 px-6 md:py-28 lg:py-36 text-center">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/logos/current/logo_icon_color.png"
              alt="Camini"
              width={160}
              height={160}
              priority
              className="size-20 sm:size-24 object-contain drop-shadow-md select-none transition-transform duration-300 hover:scale-105"
            />
            <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3.5 py-1 text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Camini v0.1 • Studio Admin
            </div>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Camini<br className="hidden sm:block" />
            <span className="text-muted-foreground">aplicações e ferramentas em um só lugar</span>
          </h1>
          
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
            Acesso unificado aos módulos operacionais, ferramentas de produtividade
            e inteligência corporativa. Design minimalista focado em alta performance.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-12 px-8 gap-2">
                Acessar Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/radar" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full h-12 px-8 gap-2">
                <Radio className="h-4 w-4" />
                Radar da Reforma
              </Button>
            </Link>
          </div>
        </section>

        {/* OBSERVATÓRIO SECTION - Publicações Editoriais */}
        <section className="mx-auto max-w-5xl px-6 py-12 md:py-16 border-t border-border/50">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                <Sparkles className="h-3.5 w-3.5" />
                Camini Observatório
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Publicações & Conteúdo Editorial</h2>
              <p className="text-muted-foreground max-w-2xl">
                Análises de atualidades e tecnologia com contexto, responsabilidade editorial e rigor técnico para ir além do ruído.
              </p>
            </div>
            <span className="self-start md:self-auto text-xs text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border">
              Acesso Aberto
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Panorama */}
            <div className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/50 hover:shadow-md">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Compass className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
                  Em preparação
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Panorama</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Uma leitura editorial que conecta acontecimentos, tendências e sinais para ir além do fato isolado. Atualidades com perspectiva ampla em política, economia, geopolítica e sociedade.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
                <Button
                  render={<Link href="/panorama" />}
                  variant="default"
                  size="sm"
                  className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Explorar Panorama
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Link href="/panorama#edicoes" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Ver edições →
                </Link>
              </div>
            </div>

            {/* Tech */}
            <div className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/50 hover:shadow-md">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Cpu className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
                  Em preparação
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Tech</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Análises sobre tecnologia e inovação para compreender o presente e acompanhar o que vem pela frente. Sinais relevantes examinados em software, pesquisa, segurança e inteligência artificial.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
                <Button
                  render={<Link href="/tech" />}
                  variant="default"
                  size="sm"
                  className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Explorar Tech
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Link href="/tech#edicoes" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Ver edições →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES/MODULES SECTION - OpenDocs Style Grid */}
        <section className="mx-auto max-w-5xl px-6 py-12 md:py-20 border-t border-border/50">
          <div className="flex flex-col gap-2 mb-10">
            <h2 className="text-2xl font-bold tracking-tight">Módulos do Sistema</h2>
            <p className="text-muted-foreground">Recursos integrados disponíveis no ecossistema Camini.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Dashboard Administrativo */}
            <Link href="/dashboard" className="group">
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
                <CardHeader>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">Dashboard Central</CardTitle>
                  <CardDescription className="text-sm mt-2">
                    Painel administrativo principal. Gestão de professores, 
                    disciplinas e programação de aulas em uma interface consolidada.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Radar da Reforma Tributária */}
            <Link href="/radar" className="group">
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
                <CardHeader>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Radio className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">Radar Tributário</CardTitle>
                  <CardDescription className="text-sm mt-2">
                    Monitoramento técnico e fiscal da Reforma Tributária (IBS, CBS, NFS-e, NF-e, CGIBS e Receita Federal).
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* RM SQL AI */}
            <Link href="/totvs-rm" className="group">
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
                <CardHeader>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Database className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">RM SQL AI</CardTitle>
                  <CardDescription className="text-sm mt-2">
                    Assistente inteligente especializado no TOTVS Corpore RM. 
                    Consulta rápida a dicionários de dados e geração de scripts.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Dicionário RM Público */}
            <Link href="/dicionario-rm" className="group">
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Layers className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Acesso Livre
                    </span>
                  </div>
                  <CardTitle className="text-xl">Dicionário RM</CardTitle>
                  <CardDescription className="text-sm mt-2">
                    Catálogo com mais de 9.400 tabelas, colunas, chaves estrangeiras, 
                    visualização lado a lado e gerador de consultas T-SQL.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Mercado & Carrinho Offline */}
            <Link href="/mercado" className="group">
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Offline-First
                    </span>
                  </div>
                  <CardTitle className="text-xl">Mercado & Carrinho</CardTitle>
                  <CardDescription className="text-sm mt-2">
                    Registro inteligente de compras no supermercado com cálculo automático, fotos de produtos e captura de cupom fiscal.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* App FORÇA */}
            <Link href="/forca" className="group">
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
                <CardHeader>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">App FORÇA</CardTitle>
                  <CardDescription className="text-sm mt-2">
                    Módulo focado em acompanhamento de alta performance, 
                    métricas de esforço (RIR) e cronômetros de descanso.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Calendário Público */}
            <Link href="/ctc/calendario" className="group">
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
                <CardHeader>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">Calendário Público</CardTitle>
                  <CardDescription className="text-sm mt-2">
                    Visualização da grade de aulas aberta aos alunos e professores.
                    Sincronizado em tempo real com o módulo CTC.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Design System Playground */}
            <Link href="/playground" className="group">
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
                <CardHeader>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Palette className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">Design System</CardTitle>
                  <CardDescription className="text-sm mt-2">
                    Catálogo vivo de componentes, tokens e padrões visuais Studio Admin integrados ao Base UI.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 md:py-12 mt-auto">
        <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <CaminiLogo variant="symbol-text" size="sm" href="/" />
            <span className="text-muted-foreground text-sm">
              © 2026. Todos os direitos reservados.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground flex-wrap">
            <Link href="/panorama" className="hover:text-foreground transition-colors">
              Panorama
            </Link>
            <Link href="/tech" className="hover:text-foreground transition-colors">
              Tech
            </Link>
            <Link href="/radar" className="hover:text-foreground transition-colors">
              Radar Tributário
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Administração
            </Link>
            <Link href="/playground" className="hover:text-foreground transition-colors">
              Design System
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
