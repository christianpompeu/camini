"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, ChevronRight } from "lucide-react";

export function DashboardHeader() {
  const pathname = usePathname();

  // Mapeamento semântico de rotas para breadcrumb compacto
  const getBreadcrumb = () => {
    if (pathname === "/dashboard") {
      return [{ label: "Painel", href: "/dashboard" }, { label: "Visão geral" }];
    }
    if (pathname === "/dashboard/ctc") {
      return [{ label: "Painel", href: "/dashboard" }, { label: "Gestão CTC", href: "/dashboard/ctc" }];
    }
    if (pathname === "/dashboard/ctc/professores") {
      return [
        { label: "Painel", href: "/dashboard" },
        { label: "CTC", href: "/dashboard/ctc" },
        { label: "Professores" },
      ];
    }
    if (pathname === "/dashboard/ctc/disciplinas") {
      return [
        { label: "Painel", href: "/dashboard" },
        { label: "CTC", href: "/dashboard/ctc" },
        { label: "Disciplinas" },
      ];
    }
    if (pathname === "/dashboard/ctc/aulas") {
      return [
        { label: "Painel", href: "/dashboard" },
        { label: "CTC", href: "/dashboard/ctc" },
        { label: "Aulas" },
      ];
    }
    return [{ label: "Painel", href: "/dashboard" }];
  };

  const breadcrumbs = getBreadcrumb();

  return (
    <header className="h-12 shrink-0 border-b border-border bg-background px-4 flex items-center justify-between z-30 sticky top-0 transition-colors">
      {/* Lado Esquerdo: Trigger + Separador + Breadcrumb */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4 hidden sm:block" />

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-medium text-foreground" : ""}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Lado Direito: Acesso ao Site + Theme Toggle */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
          title="Ir para o site institucional"
        >
          <span>Ver site</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
