"use client";

import React from "react";
import { Dumbbell, Calendar, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

export interface WorkoutCardProps {
  letter: "A" | "B" | "C" | "D" | "E";
  title: string;
  focus: string;
  exerciseCount: number;
  lastExecuted?: string;
  estimatedMinutes?: number;
  onStart?: () => void;
  className?: string;
}

export function WorkoutCard({
  letter,
  title,
  focus,
  exerciseCount,
  lastExecuted = "Há 2 dias",
  estimatedMinutes = 55,
  onStart,
  className = "",
}: WorkoutCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-outline bg-surface-elevated card-elevation transition-all duration-200 hover:border-energy-blue/40 ${className}`}
    >
      {/* Gradiente de fundo extremamente sutil no topo */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-energy opacity-85" />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Emblema Treino A/B/C */}
            <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center font-extrabold text-xl border border-outline shadow-inner">
              <span className="text-gradient-energy">{letter}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-text-primary tracking-tight">
                  {title}
                </h3>
              </div>
              <p className="text-sm font-medium text-text-secondary mt-0.5">
                {focus}
              </p>
            </div>
          </div>

          <Chip variant="default" size="sm">
            {estimatedMinutes} min
          </Chip>
        </div>

        {/* Informações secundárias */}
        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-medium text-text-secondary border-t border-outline/60 pt-4">
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4 text-energy-blue" />
            <span>{exerciseCount} exercícios</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-energy-green" />
            <span>Último: {lastExecuted}</span>
          </div>
        </div>

        {/* CTA Iniciar Treino */}
        <div className="mt-6 flex items-center gap-3">
          <Button
            variant="energy"
            size="md"
            fullWidth
            onClick={onStart}
            className="shadow-lg shadow-energy-blue/20"
          >
            <Play className="w-4 h-4 fill-white" />
            Iniciar treino
          </Button>
        </div>
      </div>
    </div>
  );
}
