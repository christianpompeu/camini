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
  Dumbbell
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const isCurrent = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen overflow-y-auto hidden md:flex">
      {/* Brand */}
      <div className="p-6 pb-2 flex items-center gap-3">
        <Image src="/icon_camini.png" alt="Camini Icon" width={32} height={32} className="rounded-lg shadow-sm" />
        <span className="font-bold text-lg text-camini-navy">Hub Integrado</span>
      </div>

      {/* User Profile */}
      <div className="px-6 py-4">
        <div className="bg-[#f3f4f6] rounded-lg p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
            <Users size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">Admin</span>
            <span className="text-xs text-gray-500">Administrador</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-2 flex flex-col gap-1">
        
        <div className="mb-4">
          <p className="px-2 text-xs font-semibold text-gray-400 mb-2 tracking-wider">MENU PRINCIPAL</p>
          <NavItem href="/dashboard" icon={<Home size={18} />} label="Página Inicial" active={pathname === "/dashboard"} />
          <NavItem href="/dashboard/workflows" icon={<FolderGit2 size={18} />} label="Workflows" />
          <NavItem href="#" icon={<CreditCard size={18} />} label="Financeiro" disabled badge="Em breve" />
          <NavItem href="#" icon={<Users size={18} />} label="RH" disabled badge="Em breve" />
        </div>

        <div className="mb-4">
          <p className="px-2 text-xs font-semibold text-gray-400 mb-2 tracking-wider">APLICAÇÕES</p>
          <NavItem href="/dashboard/totvs-rm" icon={<Database size={18} />} label="RM SQL AI" active={pathname.startsWith("/dashboard/totvs-rm")} />
          <NavItem href="/dashboard/forca" icon={<Dumbbell size={18} />} label="App FORÇA" active={pathname.startsWith("/dashboard/forca")} />
        </div>

        <div className="mb-4">
          <p className="px-2 text-xs font-semibold text-gray-400 mb-2 tracking-wider">UTILITÁRIOS</p>
          <NavItem href="/dashboard/ctc" icon={<FileText size={18} />} label="Gestão CTC" active={pathname.startsWith("/dashboard/ctc")} />
          <NavItem href="/dashboard/produtos" icon={<Package size={18} />} label="Produtos" rightIcon={<ChevronDown size={14} />} />
        </div>

        <div className="mb-4">
          <p className="px-2 text-xs font-semibold text-gray-400 mb-2 tracking-wider">ADMINISTRAÇÃO</p>
          <NavItem href="/dashboard/permissoes" icon={<Settings size={18} />} label="Permissões" />
          <NavItem href="/dashboard/config" icon={<SlidersHorizontal size={18} />} label="Configurações" />
        </div>
      </nav>

      {/* Footer Nav */}
      <div className="px-4 py-4 border-t border-gray-100 flex flex-col gap-1">
        <NavItem href="/suporte" icon={<HelpCircle size={18} />} label="Suporte" />
        <NavItem href="/ajustes" icon={<Settings size={18} />} label="Ajustes" />
        <form action="/auth/signout" method="post" className="w-full">
          <button type="submit" className="w-full flex items-center gap-3 px-2 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-lg transition-colors">
            <LogOut size={18} />
            <span>Sair do Sistema</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

function NavItem({ 
  href, 
  icon, 
  label, 
  active, 
  disabled, 
  badge, 
  rightIcon 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  disabled?: boolean;
  badge?: string;
  rightIcon?: React.ReactNode;
}) {
  const content = (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
      active 
        ? "bg-camini-indigo/10 text-camini-indigo font-bold" 
        : disabled 
          ? "text-gray-300 cursor-not-allowed" 
          : "text-camini-graphite hover:bg-camini-softgray hover:text-camini-navy font-medium"
    }`}>
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{badge}</span>}
      {rightIcon && <span className="text-gray-400">{rightIcon}</span>}
    </div>
  );

  if (disabled) return content;

  return <Link href={href}>{content}</Link>;
}
