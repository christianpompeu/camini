"use client";

import React, { useActionState } from "react";
import Image from "next/image";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="min-h-screen w-full flex bg-camini-softgray">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-camini-navy overflow-hidden items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/doodle_camini_vertical.png" 
            alt="Camini Background" 
            fill 
            className="object-cover opacity-100"
            priority
          />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100 flex flex-col relative overflow-hidden">
          
          {/* Top Decorative gradient bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-camini"></div>

          {/* Logo and Title */}
          <div className="flex flex-col items-center text-center mb-10 mt-2">
            <div className="mb-6 w-44 relative h-12">
              <Image 
                src="/logo_camini.png" 
                alt="Camini Logo" 
                fill 
                className="object-contain object-center" 
                priority
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-camini-navy tracking-tight">Acesse o Hub Integrado</h1>
            <p className="text-sm text-camini-graphite/70 mt-2">Gerencie sua instituição em um só lugar</p>
          </div>

          <form action={formAction} className="flex flex-col gap-5">
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-camini-graphite uppercase tracking-wider ml-1">Usuário / Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nome@email.com"
                required
                className="bg-camini-softgray/40 border-gray-200 focus:border-camini-indigo rounded-xl h-12 px-4 shadow-sm"
              />
            </div>

            <div className="space-y-1 relative">
              <label htmlFor="password" className="text-xs font-bold text-camini-graphite uppercase tracking-wider ml-1">Senha</label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  required
                  className="bg-camini-softgray/40 border-gray-200 focus:border-camini-indigo rounded-xl h-12 px-4 pr-12 shadow-sm"
                />
                <button
                  type="button"
                  className="absolute right-4 top-3 text-gray-400 hover:text-camini-indigo focus:outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {state?.error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center">
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              variant="ghost"
              className="w-full bg-gradient-camini text-white border-none mt-4 h-12 rounded-lg font-medium text-base transition-all hover:brightness-105 shadow-lg shadow-camini-indigo/25"
              disabled={isPending}
            >
              {isPending ? "Entrando..." : "Entrar na plataforma"}
            </Button>
          </form>
        </div>
        
        <p className="text-xs text-gray-400 mt-8 flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Camini Hub</span>
        </p>
      </div>
    </div>
  );
}
