import React from "react";
import Link from "next/link";
import {
  Home,
  LayoutDashboard,
  CalendarDays,
  Database,
  Dumbbell,
  Palette,
  Radio,
  FileQuestion,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NotFound() {
  const quickLinks = [
    {
      title: "Radar Tributário",
      description: "Monitoramento técnico e fiscal da Reforma Tributária (IBS/CBS).",
      href: "/radar",
      icon: Radio,
    },
    {
      title: "Gestão CTC",
      description: "Corpo docente, grade de disciplinas e agendamento de aulas.",
      href: "/dashboard/ctc",
      icon: CalendarDays,
    },
    {
      title: "Calendário Público",
      description: "Consulta aberta às datas e horários das aulas do CTC.",
      href: "/ctc/calendario",
      icon: CalendarDays,
    },
    {
      title: "RM SQL AI",
      description: "Consultas analíticas e dicionário de dados TOTVS RM.",
      href: "/totvs-rm",
      icon: Database,
    },
    {
      title: "App FORÇA",
      description: "Interface de execução e acompanhamento de treinos.",
      href: "/forca",
      icon: Dumbbell,
    },
    {
      title: "Design System",
      description: "Catálogo de componentes, tokens e padrões do Camini.",
      href: "/playground",
      icon: Palette,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      {/* Barra de Navegação Superior Global */}
      <Navbar />

      {/* Conteúdo Principal 404 */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-2xl w-full mx-auto flex flex-col items-center text-center space-y-6">
          {/* Badge e Ícone */}
          <div className="space-y-4">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-muted border border-border shadow-xs">
              <FileQuestion className="size-7 text-muted-foreground" />
            </div>

            <div className="flex justify-center">
              <Badge variant="outline" className="text-xs font-medium px-2.5 py-0.5">
                Erro 404 • Rota Não Encontrada
              </Badge>
            </div>
          </div>

          {/* Título e Texto */}
          <div className="space-y-2 max-w-lg">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Página não encontrada
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              O endereço que você tentou acessar não foi localizado ou não existe mais no sistema.
              Utilize os atalhos abaixo para retornar às áreas ativas do Camini.
            </p>
          </div>

          {/* Botões de Ação Principais */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <Button
              variant="default"
              nativeButton={false}
              render={<Link href="/" />}
              className="gap-2 text-xs"
            >
              <Home className="h-4 w-4" />
              <span>Página Inicial</span>
            </Button>

            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/dashboard" />}
              className="gap-2 text-xs"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Painel de Gestão</span>
            </Button>
          </div>

          {/* Acessos Rápidos Recomendados */}
          <div className="w-full pt-8 border-t border-border mt-6 text-left space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center sm:text-left">
              Módulos disponíveis no ecossistema
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="p-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-all flex items-start gap-3 group shadow-xs"
                  >
                    <div className="size-7 rounded-md bg-muted text-muted-foreground group-hover:text-foreground flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        <span>{item.title}</span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé Padronizado OpenDocs */}
      <footer className="border-t border-border py-6 px-4 sm:px-6 bg-muted/20 text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Camini</span>
            <span>•</span>
            <span>Hub Integrado de Gestão</span>
            <span>•</span>
            <span>© 2026</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">
              Início
            </Link>
            <Link href="/radar" className="hover:text-foreground transition-colors">
              Radar
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Painel
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
