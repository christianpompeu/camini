"use client";

import React from "react";
import { Dumbbell, Info, Layers, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

export interface ExerciseHeroProps {
  exerciseId?: string;
  name?: string;
  category?: string;
  muscles?: string[];
  sets?: string;
  reps?: string;
  cues?: string[];
  className?: string;
}

const MEDIA_REGISTRY: Record<string, { role: string; path: string }[]> = {
  "agachamento_goblet": [
    { role: "execution_start", path: "/media-reference/agachamento_goblet/1.png" },
    { role: "execution_end", path: "/media-reference/agachamento_goblet/2.png" },
    { role: "execution_start_female", path: "/media-reference/agachamento_goblet/3.png" },
    { role: "execution_end_female", path: "/media-reference/agachamento_goblet/4.png" },
    { role: "muscle_map_female", path: "/media-reference/agachamento_goblet/5.png" },
    { role: "muscle_map", path: "/media-reference/agachamento_goblet/6.png" },
    { role: "instruction_card", path: "/media-reference/agachamento_goblet/7.png" },
    { role: "instruction_card_female", path: "/media-reference/agachamento_goblet/8.png" },
  ],
  "remada_unilateral_com_halter": [
    { role: "instruction_card", path: "/media-reference/remada_unilateral_com_halter/7.png" }
  ]
};

export function ExerciseHero({
  exerciseId,
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
  const mediaList = exerciseId ? MEDIA_REGISTRY[exerciseId] || [] : [];
  const primaryMedia = mediaList.find(m => m.role === "execution_start") || mediaList[0];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm ${className}`}
    >
      {/* Área de Destaque Visual */}
      <div className="relative h-48 w-full bg-muted/40 border-b border-border">
        {primaryMedia ? (
          <Dialog>
            <DialogTrigger className="block relative w-full h-full cursor-pointer hover:opacity-90 transition-opacity p-0 border-none bg-transparent">
              <Image
                src={primaryMedia.path}
                  alt={name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md font-semibold backdrop-blur-sm">
                  Tocar para expandir
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-md w-full p-2 h-[85vh] flex flex-col items-center bg-black border-none">
              <DialogTitle className="sr-only">Visualizador de Galeria</DialogTitle>
              <div className="flex-1 w-full relative overflow-y-auto overflow-x-hidden snap-y snap-mandatory scrollbar-hide">
                {mediaList.map((media, idx) => (
                  <div key={idx} className="w-full h-full relative snap-center flex items-center justify-center bg-black shrink-0">
                    <Image
                      src={media.path}
                      alt={`${name} - ${media.role}`}
                      fill
                      className="object-contain"
                    />
                    <div className="absolute bottom-4 left-4 right-4 text-center text-white/80 text-xs font-semibold uppercase tracking-widest drop-shadow-md">
                      {media.role.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-white/50 text-[10px] mt-2 text-center pb-2">Role para ver mais imagens</p>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center shadow-xs mb-2 text-primary">
              <Dumbbell className="w-7 h-7" />
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Mídia Indisponível
            </span>
          </div>
        )}
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
