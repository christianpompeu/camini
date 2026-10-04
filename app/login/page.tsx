"use client";

import React, { useActionState } from "react";
import Image from "next/image";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Hexagon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Left side - Branding (Studio Style) */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between bg-zinc-950 p-10 text-white">
        <div className="flex items-center gap-2 font-semibold">
          <Hexagon className="h-6 w-6" />
          <span className="text-xl tracking-tight">Camini</span>
        </div>
        
        <div className="mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed">
              "O Hub Integrado Camini transformou nossa gestão acadêmica e operacional."
            </p>
            <footer className="text-sm text-zinc-400">Diretoria CTC</footer>
          </blockquote>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[400px]">
          <div className="flex flex-col space-y-2 text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Entrar na conta</h1>
            <p className="text-sm text-muted-foreground">Insira seu e-mail e senha para acessar o painel</p>
          </div>

          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nome@exemplo.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {state?.error && (
              <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md border border-destructive/20 font-medium">
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="px-8 text-center text-sm text-muted-foreground mt-8">
            Clicando em entrar, você concorda com nossos{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">Termos de Serviço</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

