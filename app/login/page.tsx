"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background text-foreground">
      {/* Lado Esquerdo: Painel Institucional Studio Baseline (Apenas Desktop) */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between bg-zinc-950 p-10 text-white relative">
        <div className="flex items-center justify-between z-10">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-white hover:text-zinc-200 transition-colors"
          >
            <div className="h-8 w-8 rounded-md bg-white text-zinc-950 font-bold flex items-center justify-center text-sm shadow-xs">
              C
            </div>
            <span className="text-xl font-semibold tracking-tight">Camini</span>
          </Link>
          <ThemeToggle className="border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-white" />
        </div>

        <div className="my-auto max-w-md z-10">
          <h2 className="text-2xl font-bold tracking-tight mb-3">
            Plataforma Integrada de Gestão
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Acesso unificado aos módulos acadêmicos, operacionais e de inteligência corporativa do ecossistema Camini.
          </p>
        </div>

        <div className="z-10 text-xs text-zinc-500">
          Camini &bull; Todos os direitos reservados
        </div>
      </div>

      {/* Lado Direito: Formulário de Autenticação */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-6 sm:p-12 min-h-screen md:min-h-auto">
        <div className="flex items-center justify-between w-full max-w-sm mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao site
          </Link>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto my-auto py-8">
          <div className="flex flex-col space-y-2 mb-8">
            <div className="flex items-center gap-2 md:hidden mb-4">
              <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs">
                C
              </div>
              <span className="font-semibold text-lg tracking-tight">Camini</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Acesso ao painel
            </h1>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais de administrador para continuar.
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                required
                autoComplete="email"
                disabled={isPending}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  disabled={isPending}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha em texto"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none transition-colors p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {state?.error && (
              <div
                role="alert"
                aria-live="polite"
                className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 font-medium"
              >
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 font-medium"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando credenciais...
                </>
              ) : (
                "Entrar no painel"
              )}
            </Button>
          </form>
        </div>

        <div className="w-full max-w-sm mx-auto text-center text-xs text-muted-foreground pt-4">
          Ambiente corporativo seguro &bull; Camini v0.1
        </div>
      </div>
    </div>
  );
}
