"use client";

import React from "react";
import { Dumbbell, Info, Layers, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      className={`relative overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm ${className}`}
    >
      {/* Área de Destaque Visual */}
      <div className="relative h-40 sm:h-48 w-full bg-muted/40 border-b border-border flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center p-4">
          <div className="w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center shadow-xs mb-2 text-primary">
            <Dumbbell className="w-7 h-7" />
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            Exercício Composto
          </span>
        </div>
      </div>

      {/* Conteúdo textual do Exercício */}
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs font-semibold">
              {category}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Layers className="w-3.5 h-3.5" />
              <span>{sets}</span>
              <span>•</span>
              <Repeat className="w-3.5 h-3.5" />
              <span>{reps}</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {name}
          </h2>
        </div>

        {/* Músculos trabalhados */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
            Músculos Ativados
          </span>
          <div className="flex flex-wrap gap-1.5">
            {muscles.map((muscle, idx) => (
              <Badge
                key={idx}
                variant={idx === 0 ? "default" : "outline"}
                className="text-xs font-medium"
              >
                {muscle}
              </Badge>
            ))}
          </div>
        </div>

        {/* Instruções Essenciais / Cues de Execução */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-2 mb-2.5">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Instruções de Execução
            </span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {cues.map((cue, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/60 mt-2 shrink-0" />
                <span>{cue}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
