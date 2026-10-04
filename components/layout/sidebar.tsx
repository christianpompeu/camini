"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  FolderGit2, 
  CreditCard, 
  Users, 
  FileText, 
  Package, 
  Settings, 
  SlidersHorizontal,
  LogOut,
  Database,
  Dumbbell,
  Hexagon,
  ChevronDown,
  ArrowLeft
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

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" onClick={closeMobile} className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Hexagon className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold tracking-tight text-base">Camini Hub</span>
                  <span className="text-xs text-muted-foreground">Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* MENU PRINCIPAL */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                <Link href="/dashboard" onClick={closeMobile}>
                  <Home />
                  <span>Página Inicial</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/workflows")}>
                <Link href="/dashboard/workflows" onClick={closeMobile}>
                  <FolderGit2 />
                  <span>Workflows</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <CreditCard />
                <span>Financeiro</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <Users />
                <span>RH</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* APLICAÇÕES */}
        <SidebarGroup>
          <SidebarGroupLabel>Aplicações</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/totvs-rm")}>
                <Link href="/dashboard/totvs-rm" onClick={closeMobile}>
                  <Database />
                  <span>RM SQL AI</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/forca")}>
                <Link href="/dashboard/forca" onClick={closeMobile}>
                  <Dumbbell />
                  <span>App FORÇA</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* UTILITÁRIOS */}
        <SidebarGroup>
          <SidebarGroupLabel>Utilitários</SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible defaultOpen={pathname.startsWith("/dashboard/ctc")} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton isActive={pathname.startsWith("/dashboard/ctc")}>
                    <FileText />
                    <span>Gestão CTC</span>
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={pathname === "/dashboard/ctc"}>
                        <Link href="/dashboard/ctc" onClick={closeMobile}>
                          <span>Visão Geral</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={pathname === "/dashboard/ctc/professores"}>
                        <Link href="/dashboard/ctc/professores" onClick={closeMobile}>
                          <span>Professores</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={pathname === "/dashboard/ctc/disciplinas"}>
                        <Link href="/dashboard/ctc/disciplinas" onClick={closeMobile}>
                          <span>Disciplinas</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={pathname === "/dashboard/ctc/aulas"}>
                        <Link href="/dashboard/ctc/aulas" onClick={closeMobile}>
                          <span>Aulas Programadas</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/produtos")}>
                <Link href="/dashboard/produtos" onClick={closeMobile}>
                  <Package />
                  <span>Produtos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* ADMINISTRAÇÃO */}
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/permissoes")}>
                <Link href="/dashboard/permissoes" onClick={closeMobile}>
                  <Settings />
                  <span>Permissões</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/config")}>
                <Link href="/dashboard/config" onClick={closeMobile}>
                  <SlidersHorizontal />
                  <span>Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/" className="bg-primary/10 text-primary hover:bg-primary/20">
                <ArrowLeft className="mr-2" />
                <span>Sair do Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">A</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Admin</span>
                <span className="truncate text-xs text-muted-foreground">admin@camini.com</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
