"use client";

import React from "react";
import { Dumbbell, Info, Layers, Repeat } from "lucide-react";
import { Chip } from "@/components/ui/chip";

export interface ExerciseHeroProps {
  name?: string;
  category?: string;
  muscles?: string[];
  sets?: string;
  reps?: string;
  cues?: string[];
  className?: string;
}

export function ExerciseHero({
  name = "Supino Reto com Barra",
  category = "Peitoral & Tríceps",
  muscles = ["Peitoral Maior", "Deltoide Anterior", "Tríceps Braquial"],
  sets = "4 Séries",
  reps = "6 a 10 Repetições",
  cues = [
    "Escápulas retraídas e deprimidas durante todo o movimento.",
    "Trajetória da barra ligeiramente em arco até a linha dos mamilos.",
    "Pausa controlada de 1s no ponto de maior contração.",
  ],
  className = "",
}: ExerciseHeroProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-outline bg-surface-elevated card-elevation ${className}`}
    >
      {/* Imagem / Área Visual com Gradiente Protetor de Legibilidade */}
      <div className="relative h-48 sm:h-56 w-full bg-surface-dark overflow-hidden flex items-center justify-center">
        {/* Arte abstrata geométrica de exercício */}
        <div className="absolute inset-0 bg-gradient-to-tr from-surface-dark via-surface-dark/90 to-energy-blue/20" />

        {/* Ilustração geométrica contemporânea */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
          <div className="w-16 h-16 rounded-pill bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl mb-2 tap-effect">
            <Dumbbell className="w-8 h-8 text-energy-cyan" />
          </div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-energy-cyan/90">
            Exercício Composto
          </span>
        </div>

        {/* Gradiente suave inferior para legibilidade absoluta */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-elevated via-surface-elevated/70 to-transparent" />
      </div>

      {/* Conteúdo textual do Exercício */}
      <div className="p-6 relative -mt-8 z-10">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Chip variant="energy" size="sm" className="text-xs">
            {category}
          </Chip>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
            <Layers className="w-3.5 h-3.5 text-energy-blue" />
            <span>{sets}</span>
            <span>•</span>
            <Repeat className="w-3.5 h-3.5 text-energy-green" />
            <span>{reps}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          {name}
        </h1>

        {/* Músculos trabalhados */}
        <div className="mt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-2">
            Músculos Ativados
          </span>
          <div className="flex flex-wrap gap-1.5">
            {muscles.map((muscle, idx) => (
              <Chip
                key={idx}
                variant={idx === 0 ? "active" : "outline"}
                size="sm"
              >
                {muscle}
              </Chip>
            ))}
          </div>
        </div>

        {/* Instruções Essenciais / Cues de Execução */}
        <div className="mt-5 p-4 rounded-lg bg-surface border border-outline/70">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-energy-blue" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Instruções de Execução
            </span>
          </div>
          <ul className="space-y-1.5 text-xs text-text-secondary leading-relaxed">
            {cues.map((cue, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-energy-blue mt-1.5 shrink-0" />
                <span>{cue}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
