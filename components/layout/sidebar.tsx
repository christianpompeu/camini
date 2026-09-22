"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  HelpCircle,
  LogOut,
  ChevronDown,
  Database,
  Dumbbell,
  X,
  ArrowLeft
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isOpenMobile = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (isMobile = false) => (
    <>
      {/* Brand & Close Button */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <Link href="/" onClick={onCloseMobile} className="flex items-center gap-3">
          <Image src="/icon_camini.png" alt="Camini Icon" width={32} height={32} className="rounded-lg shadow-sm" />
          <span className="font-bold text-lg text-camini-navy dark:text-white">Hub Integrado</span>
        </Link>

        {/* Botão de Fechar no Mobile */}
        {isMobile && (
          <button
            onClick={onCloseMobile}
            aria-label="Fechar menu"
            className="w-10 h-10 rounded-pill bg-surface-elevated border border-outline flex items-center justify-center text-text-secondary hover:text-text-primary tap-effect cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Profile & Botão Voltar ao Camini com Gradiente de Destaque */}
      <div className="px-4 py-3 flex flex-col gap-2.5">
        <div className="w-full bg-[#f3f4f6] dark:bg-slate-800/60 rounded-lg p-3 flex items-center gap-3 border border-transparent dark:border-slate-800">
          <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300">
            <Users size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Admin</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Administrador</span>
          </div>
        </div>

        {/* Botão com Gradiente de Destaque para Voltar ao Camini */}
        <Link
          href="/"
          onClick={onCloseMobile}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-camini shadow-md shadow-blue-500/25 hover:shadow-lg hover:brightness-105 active:scale-[0.98] transition-all tap-effect"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Camini</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-2 flex flex-col gap-1">
        
        <div className="mb-4">
          <p className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 tracking-wider">MENU PRINCIPAL</p>
          <NavItem href="/dashboard" icon={<Home size={18} />} label="Página Inicial" active={pathname === "/dashboard"} onClick={onCloseMobile} />
          <NavItem href="/dashboard/workflows" icon={<FolderGit2 size={18} />} label="Workflows" active={pathname.startsWith("/dashboard/workflows")} onClick={onCloseMobile} />
          <NavItem href="#" icon={<CreditCard size={18} />} label="Financeiro" disabled badge="Em breve" />
          <NavItem href="#" icon={<Users size={18} />} label="RH" disabled badge="Em breve" />
        </div>

        <div className="mb-4">
          <p className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 tracking-wider">APLICAÇÕES</p>
          <NavItem href="/dashboard/totvs-rm" icon={<Database size={18} />} label="RM SQL AI" active={pathname.startsWith("/dashboard/totvs-rm")} onClick={onCloseMobile} />
          <NavItem href="/dashboard/forca" icon={<Dumbbell size={18} />} label="App FORÇA" active={pathname.startsWith("/dashboard/forca")} onClick={onCloseMobile} />
        </div>

        <div className="mb-4">
          <p className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 tracking-wider">UTILITÁRIOS</p>
          <NavItem href="/dashboard/ctc" icon={<FileText size={18} />} label="Gestão CTC" active={pathname.startsWith("/dashboard/ctc")} onClick={onCloseMobile} />
          <NavItem href="/dashboard/produtos" icon={<Package size={18} />} label="Produtos" active={pathname.startsWith("/dashboard/produtos")} rightIcon={<ChevronDown size={14} />} onClick={onCloseMobile} />
        </div>

        <div className="mb-4">
          <p className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 tracking-wider">ADMINISTRAÇÃO</p>
          <NavItem href="/dashboard/permissoes" icon={<Settings size={18} />} label="Permissões" active={pathname.startsWith("/dashboard/permissoes")} onClick={onCloseMobile} />
          <NavItem href="/dashboard/config" icon={<SlidersHorizontal size={18} />} label="Configurações" active={pathname.startsWith("/dashboard/config")} onClick={onCloseMobile} />
        </div>
      </nav>

      {/* Footer Nav & Theme Toggle */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-1">
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800/40 mb-2 border border-gray-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Tema do Sistema</span>
          <ThemeToggle />
        </div>
        <NavItem href="/suporte" icon={<HelpCircle size={18} />} label="Suporte" onClick={onCloseMobile} />
        <NavItem href="/ajustes" icon={<Settings size={18} />} label="Ajustes" onClick={onCloseMobile} />
        <form action="/auth/signout" method="post" className="w-full">
          <button type="submit" className="w-full flex items-center gap-3 px-2 py-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-lg transition-colors cursor-pointer">
            <LogOut size={18} />
            <span>Sair do Sistema</span>
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* 1. SIDEBAR DESKTOP: Fixa à esquerda no desktop */}
      <aside className="w-64 bg-white dark:bg-[#0c1017] border-r border-gray-200 dark:border-slate-800 flex-col h-screen overflow-y-auto hidden md:flex shrink-0">
        {sidebarContent(false)}
      </aside>

      {/* 2. GAVETA MOBILE: Desliza da DIREITA (right-0) no mobile */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-[visibility] duration-300 ${
          isOpenMobile ? "visible pointer-events-auto" : "invisible pointer-events-none"
        }`}
        aria-hidden={!isOpenMobile}
      >
        {/* Backdrop escuro com blur com transição de opacidade */}
        <div 
          onClick={onCloseMobile}
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
            isOpenMobile ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />

        {/* Drawer vindo do lado DIREITO */}
        <aside 
          role="dialog"
          aria-modal="true"
          aria-label="Menu do Painel Camini"
          className={`
            fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-xl border-l border-gray-200 dark:border-slate-800 flex flex-col h-screen overflow-y-auto shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform
            ${isOpenMobile ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {sidebarContent(true)}
        </aside>
      </div>
    </>
  );
}

function NavItem({ 
  href, 
  icon, 
  label, 
  active, 
  disabled, 
  badge, 
  rightIcon,
  onClick
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  disabled?: boolean; 
  badge?: string; 
  rightIcon?: React.ReactNode; 
  onClick?: () => void; 
}) {
  const content = (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 tap-effect ${
      active 
        ? "bg-gradient-camini text-white font-semibold shadow-md shadow-blue-500/25" 
        : disabled 
          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" 
          : "text-camini-graphite dark:text-gray-300 hover:bg-camini-softgray dark:hover:bg-slate-800/60 hover:text-camini-navy dark:hover:text-white font-medium"
    }`}>
      <div className="flex items-center gap-3">
        <span className={active ? "text-white" : ""}>{icon}</span>
        <span className={active ? "text-white" : ""}>{label}</span>
      </div>
      {badge && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
          active 
            ? "bg-white/20 text-white font-bold" 
            : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400"
        }`}>
          {badge}
        </span>
      )}
      {rightIcon && <span className={active ? "text-white" : "text-gray-400 dark:text-gray-500"}>{rightIcon}</span>}
    </div>
  );

  if (disabled) return content;

  return <Link href={href} onClick={onClick}>{content}</Link>;
}
