import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Home, Layers, Sparkles, ArrowLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface text-text-primary selection:bg-energy-blue/20">
      {/* Barra de Navegação Superior Global */}
      <Navbar />

      {/* Conteúdo Principal 404 */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
        {/* Glows e Iluminação de Fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[750px] h-[350px] sm:h-[450px] bg-gradient-to-r from-energy-blue/15 via-energy-violet/15 to-energy-coral/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl w-full mx-auto flex flex-col items-center text-center relative z-10">
          
          {/* Ilustração com Doodle Camini */}
          <div className="relative w-full max-w-lg h-56 sm:h-72 mb-6 group select-none">
            {/* Efeito de backdrop glass no doodle */}
            <div className="absolute inset-0 rounded-3xl bg-surface-elevated/40 border border-outline/50 backdrop-blur-sm -z-10 shadow-xl shadow-black/5 dark:shadow-black/40 transition-transform duration-500 group-hover:scale-[1.02]" />
            
            <Image
              src="/doodle_camini_3.png"
              alt="Doodle Ilustrativo Camini 404"
              fill
              priority
              className="object-contain p-4 drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Badge Flutuante 404 */}
            <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-surface-elevated border border-outline shadow-lg flex items-center gap-2 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-energy-coral animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                Erro 404 • Rota Não Encontrada
              </span>
            </div>
          </div>

          {/* Título e Texto */}
          <div className="space-y-3 mt-4 max-w-xl">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-text-primary">
              Perdido no <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-energy">
                Ecossistema camini?
              </span>
            </h1>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              A página que você tentou acessar não foi localizada, foi movida ou não existe mais. Use os atalhos abaixo para retornar às áreas ativas.
            </p>
          </div>

          {/* Ações e Navegação */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
            <Link href="/" className="w-full sm:w-auto flex-1">
              <Button variant="energy" size="lg" fullWidth className="gap-2 shadow-lg shadow-energy-blue/20">
                <Home className="w-4 h-4" />
                Página Inicial
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full sm:w-auto flex-1">
              <Button variant="secondary" size="lg" fullWidth className="gap-2 border-outline hover:border-energy-blue">
                <Layers className="w-4 h-4 text-energy-blue" />
                Painel Hub
              </Button>
            </Link>
          </div>

          {/* Módulos Sugeridos em Cards Compactos */}
          <div className="mt-12 w-full max-w-2xl pt-8 border-t border-outline/60">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4">
              Acessos rápidos recomendados
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link 
                href="/dashboard/ctc" 
                className="p-3.5 rounded-xl bg-surface-elevated/70 border border-outline hover:border-energy-blue/50 transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-energy-blue" />
                  <span className="text-xs font-bold text-text-primary group-hover:text-energy-blue transition-colors">
                    Gestão CTC
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary line-clamp-2">
                  Curso de Teologia, professores e calendário.
                </p>
              </Link>

              <Link 
                href="/totvs-rm" 
                className="p-3.5 rounded-xl bg-surface-elevated/70 border border-outline hover:border-energy-cyan/50 transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-energy-cyan" />
                  <span className="text-xs font-bold text-text-primary group-hover:text-energy-cyan transition-colors">
                    RM SQL AI
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary line-clamp-2">
                  Dicionário e consultas inteligentes TOTVS.
                </p>
              </Link>

              <Link 
                href="/playground" 
                className="p-3.5 rounded-xl bg-surface-elevated/70 border border-outline hover:border-energy-violet/50 transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-energy-violet" />
                  <span className="text-xs font-bold text-text-primary group-hover:text-energy-violet transition-colors">
                    Design System
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary line-clamp-2">
                  Playground de componentes e tokens.
                </p>
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Rodapé Padronizado */}
      <footer className="border-t border-outline py-6 px-4 sm:px-8 bg-surface-elevated/60 text-xs text-text-secondary">
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
            <Link href="/dashboard" className="hover:text-energy-coral transition-colors">
              Dashboard
            </Link>
            <Link href="/playground" className="hover:text-energy-violet transition-colors">
              Design System
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
