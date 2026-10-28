"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

  const navItems = [
    {
      href: "/",
      label: "Início",
      isActive: isHome && !isDashboard && !isObservatorio,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      isActive: isDashboard,
    },
    {
      href: "/mercado",
      label: "Mercado",
      isActive: isMercado,
    },
    {
      href: "/radar",
      label: "Radar Tributário",
      isActive: isRadar,
    },
    {
      href: "/totvs-rm",
      label: "RM SQL AI",
      isActive: isTotvsRm,
    },
    {
      href: "/dicionario-rm",
      label: "Dicionário RM",
      isActive: isDicionario,
    },
    {
      href: "/forca",
      label: "App FORÇA",
      isActive: isForca,
    },
    {
      href: "/playground",
      label: "Design System",
      isActive: isPlayground,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          {/* Logo */}
          <CaminiLogo variant="symbol-text" size="sm" href="/" priority />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground/80 ${
                isHome && !isDashboard && !isObservatorio ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Início
            </Link>

            {/* Observatório Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`inline-flex items-center gap-1 transition-colors hover:text-foreground/80 focus-visible:outline-none cursor-pointer ${
                  isObservatorio ? "text-foreground font-semibold" : "text-foreground/60"
                }`}
              >
                <span>Observatório</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-1.5 shadow-lg border border-border bg-popover text-popover-foreground">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 select-none">
                  Publicações
                </div>
                <DropdownMenuItem
                  render={<Link href="/panorama" />}
                  className="flex flex-col items-start gap-0.5 p-2 rounded-md cursor-pointer hover:bg-muted/60 focus:bg-muted/60"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-sm">Panorama</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                      Em preparação
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Atualidades, conexões e contexto
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/tech" />}
                  className="flex flex-col items-start gap-0.5 p-2 rounded-md cursor-pointer hover:bg-muted/60 focus:bg-muted/60"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-sm">Tech</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      Em preparação
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Tecnologia, inovação, IA e software
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {navItems.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-foreground/80 ${
                  item.isActive ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

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
