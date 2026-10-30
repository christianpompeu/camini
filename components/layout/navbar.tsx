"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  ChevronDown,
  LayoutGrid,
  TrendingUp,
  Dumbbell,
  Radio,
  Compass,
  Cpu,
  Database,
  Bot,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CaminiLogo } from "@/components/ui/camini-logo";

export function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");
  const isForca = pathname.startsWith("/forca");
  const isTotvsRm = pathname.startsWith("/totvs-rm");
  const isRadar = pathname.startsWith("/radar");
  const isDicionario = pathname.startsWith("/dicionario");
  const isPlayground = pathname.startsWith("/playground");
  const isObservatorio = pathname.startsWith("/panorama") || pathname.startsWith("/tech");
  const isMercado = pathname.startsWith("/mercado");

  // Estados ativos por suíte de negócio
  const isGestaoActive = isDashboard || isMercado || isForca;
  const isFiscalActive = isRadar || isObservatorio;
  const isTotvsRmActive = isTotvsRm || isDicionario;

  // Itens da suíte Gestão & BI
  const gestaoItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      subtitle: "Visão executiva, métricas e analytics",
      icon: LayoutGrid,
      isActive: isDashboard,
    },
    {
      href: "/mercado",
      label: "Mercado",
      subtitle: "Painel macroeconômico e indicadores",
      icon: TrendingUp,
      isActive: isMercado,
    },
    {
      href: "/forca",
      label: "App FORÇA",
      subtitle: "Força de vendas, pedidos e CRM",
      icon: Dumbbell,
      isActive: isForca,
    },
  ];

  // Itens da suíte TOTVS RM
  const totvsRmItems = [
    {
      href: "/dicionario-rm",
      label: "Dicionário RM",
      subtitle: "Catálogo de dados, esquemas e grafos FK",
      icon: Database,
      badge: "Novo",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      isActive: isDicionario,
    },
    {
      href: "/totvs-rm",
      label: "RM SQL AI",
      subtitle: "Assistente inteligente e gerador T-SQL",
      icon: Bot,
      isActive: isTotvsRm,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Lado Esquerdo: Logo + Navegação por Domínios */}
          <div className="flex items-center gap-6 lg:gap-8">
            <CaminiLogo variant="symbol-text" size="sm" href="/" priority />

            {/* Desktop Nav - 4 a 5 itens agrupados por suíte de negócio */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
              {/* Início */}
              <Link
                href="/"
                className={`px-2.5 py-1.5 rounded-md transition-colors hover:text-foreground hover:bg-muted/50 whitespace-nowrap ${
                  isHome && !isDashboard && !isObservatorio
                    ? "text-foreground font-semibold bg-muted/40"
                    : "text-foreground/70"
                }`}
              >
                Início
              </Link>

              {/* Dropdown: Gestão & BI */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors hover:text-foreground hover:bg-muted/50 focus-visible:outline-none cursor-pointer whitespace-nowrap ${
                    isGestaoActive
                      ? "text-foreground font-semibold bg-muted/40"
                      : "text-foreground/70"
                  }`}
                >
                  <span>Gestão & BI</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform duration-200" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-72 p-1.5 shadow-xl border border-border/80 bg-popover text-popover-foreground rounded-xl"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 select-none">
                    Suíte de Gestão
                  </div>
                  {gestaoItems.map((item) => (
                    <DropdownMenuItem
                      key={item.href}
                      render={<Link href={item.href} />}
                      className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-muted/70 focus:bg-muted/70 transition-colors ${
                        item.isActive ? "bg-muted/50 font-semibold" : ""
                      }`}
                    >
                      <div className="p-1.5 rounded-md bg-muted text-muted-foreground shrink-0 mt-0.5">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-semibold text-sm text-foreground">
                            {item.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Dropdown: Fiscal & Tributário */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors hover:text-foreground hover:bg-muted/50 focus-visible:outline-none cursor-pointer whitespace-nowrap ${
                    isFiscalActive
                      ? "text-foreground font-semibold bg-muted/40"
                      : "text-foreground/70"
                  }`}
                >
                  <span>Fiscal & Tributário</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform duration-200" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-80 p-1.5 shadow-xl border border-border/80 bg-popover text-popover-foreground rounded-xl"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 select-none">
                    Inteligência Tributária
                  </div>
                  <DropdownMenuItem
                    render={<Link href="/radar" />}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-muted/70 focus:bg-muted/70 transition-colors ${
                      isRadar ? "bg-muted/50 font-semibold" : ""
                    }`}
                  >
                    <div className="p-1.5 rounded-md bg-muted text-muted-foreground shrink-0 mt-0.5">
                      <Radio className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-semibold text-sm text-foreground">
                          Radar Tributário
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Reforma
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Monitoramento e alertas da Reforma Tributária IBS/CBS
                      </p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1.5" />

                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 select-none">
                    Observatório
                  </div>
                  <DropdownMenuItem
                    render={<Link href="/panorama" />}
                    className={`flex items-start gap-2.5 p-2 rounded-md cursor-pointer hover:bg-muted/70 focus:bg-muted/70 transition-colors ${
                      pathname.startsWith("/panorama") ? "bg-muted/50 font-semibold" : ""
                    }`}
                  >
                    <div className="p-1.5 rounded-md bg-muted text-muted-foreground shrink-0 mt-0.5">
                      <Compass className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-semibold text-sm text-foreground">Panorama</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                          Em preparação
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Atualidades, conexões e contexto
                      </p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href="/tech" />}
                    className={`flex items-start gap-2.5 p-2 rounded-md cursor-pointer hover:bg-muted/70 focus:bg-muted/70 transition-colors ${
                      pathname.startsWith("/tech") ? "bg-muted/50 font-semibold" : ""
                    }`}
                  >
                    <div className="p-1.5 rounded-md bg-muted text-muted-foreground shrink-0 mt-0.5">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-semibold text-sm text-foreground">Tech</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          Em preparação
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Tecnologia, inovação, IA e software
                      </p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Dropdown: TOTVS RM */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors hover:text-foreground hover:bg-muted/50 focus-visible:outline-none cursor-pointer whitespace-nowrap ${
                    isTotvsRmActive
                      ? "text-foreground font-semibold bg-muted/40"
                      : "text-foreground/70"
                  }`}
                >
                  <span>TOTVS RM</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform duration-200" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-76 p-1.5 shadow-xl border border-border/80 bg-popover text-popover-foreground rounded-xl"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 select-none">
                    Ecossistema RM
                  </div>
                  {totvsRmItems.map((item) => (
                    <DropdownMenuItem
                      key={item.href}
                      render={<Link href={item.href} />}
                      className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-muted/70 focus:bg-muted/70 transition-colors ${
                        item.isActive ? "bg-muted/50 font-semibold" : ""
                      }`}
                    >
                      <div className="p-1.5 rounded-md bg-muted text-muted-foreground shrink-0 mt-0.5">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-semibold text-sm text-foreground">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                item.badgeClass || "bg-primary/10 text-primary"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Design System */}
              <Link
                href="/playground"
                className={`px-2.5 py-1.5 rounded-md transition-colors hover:text-foreground hover:bg-muted/50 whitespace-nowrap ${
                  isPlayground
                    ? "text-foreground font-semibold bg-muted/40"
                    : "text-foreground/70"
                }`}
              >
                Design System
              </Link>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex">
              <ThemeToggle />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden hover:bg-muted"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Mobile Drawer */}
      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}
