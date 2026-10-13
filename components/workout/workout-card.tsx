"use client";

import React from "react";
import { Dumbbell, Calendar, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface WorkoutCardProps {
  letter: "A" | "B" | "C" | "D" | "E";
  title: string;
  focus: string;
  exerciseCount: number;
  lastExecuted?: string;
  estimatedMinutes?: number;
  isActiveSession?: boolean;
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
  isActiveSession = false,
  onStart,
  className = "",
}: WorkoutCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border transition-all duration-200 shadow-sm ${
        isActiveSession
          ? "border-emerald-500/60 bg-emerald-500/[0.04] shadow-emerald-500/10 hover:border-emerald-500"
          : "border-border bg-card text-card-foreground hover:border-foreground/25 hover:shadow-md"
      } ${className}`}
    >
      <div className="p-5 sm:p-6 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Emblema Treino A/B/C */}
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 shadow-sm ${
                  isActiveSession
                    ? "bg-emerald-600 text-white"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <span>{letter}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight leading-tight">
                    {title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {focus}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              {isActiveSession ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-semibold">
                  Em andamento
                </Badge>
              ) : null}
              <Badge variant="secondary" className="text-xs font-semibold">
                {estimatedMinutes} min
              </Badge>
            </div>
          </div>

          {/* Informações secundárias */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground border-t border-border/60 pt-3.5">
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>{exerciseCount} exercícios</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Último: {lastExecuted}</span>
            </div>
          </div>
        </div>

        {/* CTA Iniciar Treino ou Continuar */}
        <div className="mt-5 pt-1">
          <Button
            variant="default"
            size="default"
            className={`w-full gap-2 font-semibold h-10 ${
              isActiveSession
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : ""
            }`}
            onClick={onStart}
          >
            <Play className="w-4 h-4 fill-current" />
            {isActiveSession ? "Continuar treino" : "Iniciar treino"}
          </Button>
        </div>
      </div>
    </div>
  );
}
