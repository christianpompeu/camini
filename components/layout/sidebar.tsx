"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Database,
  Dumbbell,
  Calendar,
  LogOut,
  ChevronRight,
  Globe,
  Palette
} from "lucide-react";
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  const closeMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isCtcActive = pathname.startsWith("/dashboard/ctc") || pathname.startsWith("/ctc");
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [ctcOpen, setCtcOpen] = useState(isCtcActive);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (isCtcActive) {
      setCtcOpen(true);
    }
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Header com Assinatura Camini */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" onClick={closeMobile} />}
              className="hover:bg-sidebar-accent"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm shrink-0">
                C
              </div>
              <div className="flex flex-col gap-0.5 leading-none overflow-hidden">
                <span className="font-semibold tracking-tight text-sm text-sidebar-foreground truncate">
                  Camini
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  Painel de Gestão
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* NAVEGAÇÃO PRINCIPAL */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/dashboard" onClick={closeMobile} />}
                isActive={pathname === "/dashboard"}
                tooltip="Visão geral"
              >
                <LayoutDashboard className="size-4" />
                <span>Visão geral</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* MÓDULO CTC COM SUBROTAS VERIFICADAS */}
            <Collapsible
              open={ctcOpen}
              onOpenChange={setCtcOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger
                  render={
                    <SidebarMenuButton
                      isActive={isCtcActive}
                      tooltip="Gestão CTC"
                    >
                      <GraduationCap className="size-4" />
                      <span>Gestão CTC</span>
                      <ChevronRight className={`ml-auto size-4 transition-transform duration-200 ${ctcOpen ? "rotate-90" : ""}`} />
                    </SidebarMenuButton>
                  }
                />
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        render={<Link href="/dashboard/ctc" onClick={closeMobile} />}
                        isActive={pathname === "/dashboard/ctc"}
                      >
                        <span>Visão Geral</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        render={<Link href="/dashboard/ctc/professores" onClick={closeMobile} />}
                        isActive={pathname === "/dashboard/ctc/professores"}
                      >
                        <span>Professores</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        render={<Link href="/dashboard/ctc/disciplinas" onClick={closeMobile} />}
                        isActive={pathname === "/dashboard/ctc/disciplinas"}
                      >
                        <span>Disciplinas</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        render={<Link href="/dashboard/ctc/aulas" onClick={closeMobile} />}
                        isActive={pathname === "/dashboard/ctc/aulas"}
                      >
                        <span>Aulas Programadas</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        render={<Link href="/ctc/calendario" onClick={closeMobile} />}
                        isActive={pathname === "/ctc/calendario"}
                      >
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="size-3" />
                          Calendário Público
                        </span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        {/* APLICAÇÕES VERIFICADAS */}
        <SidebarGroup>
          <SidebarGroupLabel>Aplicações</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/totvs-rm" onClick={closeMobile} />}
                isActive={pathname.startsWith("/totvs-rm")}
                tooltip="RM SQL AI"
              >
                <Database className="size-4" />
                <span>RM SQL AI</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/forca" onClick={closeMobile} />}
                isActive={pathname.startsWith("/forca")}
                tooltip="App FORÇA"
              >
                <Dumbbell className="size-4" />
                <span>App FORÇA</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/playground" onClick={closeMobile} />}
                isActive={pathname.startsWith("/playground")}
                tooltip="Design System"
              >
                <Palette className="size-4" />
                <span>Design System</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* SITE INSTITUCIONAL */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/" onClick={closeMobile} />}
                tooltip="Site Principal"
              >
                <Globe className="size-4" />
                <span>Site Principal</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER: IDENTIFICAÇÃO E LOGOUT REAL */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-sidebar-accent transition-colors group-data-[collapsible=icon]:justify-center">
              <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
                <Avatar className="h-7 w-7 rounded-md">
                  <AvatarFallback className="rounded-md text-xs font-semibold bg-muted text-foreground">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left leading-tight overflow-hidden">
                  <span className="text-xs font-medium truncate text-sidebar-foreground">
                    Administração
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    Painel Operacional
                  </span>
                </div>
              </div>

              {/* Botão de Logout Funcional via Server Action /auth/signout */}
              <form action="/auth/signout" method="POST" className="shrink-0">
                <button
                  type="submit"
                  aria-label="Encerrar sessão"
                  title="Sair da conta"
                  className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="size-3.5" />
                </button>
              </form>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
