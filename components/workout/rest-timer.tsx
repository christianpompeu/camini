"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RestTimerProps {
  initialSeconds?: number;
  onFinish?: () => void;
  className?: string;
}

export function RestTimer({
  initialSeconds = 90,
  onFinish,
  className = "",
}: RestTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsActive(false);
          onFinishRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const toggleActive = () => setIsActive((prev) => !prev);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(totalSeconds);
  };

  const addTime = (secs: number) => {
    setTimeLeft((prev) => prev + secs);
    setTotalSeconds((prev) => Math.max(prev, timeLeft + secs));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // SVG Progress Ring calculations
  const radius = 64;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div
      className={`relative p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center ${className}`}
    >
      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">
          Descanso Entre Séries
        </span>
      </div>

      {/* Anel de Progresso Circular em SVG */}
      <div className="relative w-44 h-44 flex items-center justify-center my-2">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 160 160"
        >
          {/* Fundo do anel */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/60"
          />
          {/* Anel ativo de progresso */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-primary transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Display do Tempo em Destaque */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-foreground tracking-tight font-mono">
            {formattedTime}
          </span>
          <span className="text-xs font-medium text-muted-foreground mt-1">
            {isActive ? "Em andamento" : timeLeft === 0 ? "Tempo esgotado!" : "Pausado"}
          </span>
        </div>
      </div>

      {/* Controles de Cronômetro */}
      <div className="flex items-center gap-2.5 mt-4 w-full max-w-xs">
        <Button
          variant="outline"
          size="default"
          onClick={resetTimer}
          aria-label="Reiniciar cronômetro"
          className="flex-1 h-10 gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </Button>

        <Button
          variant={isActive ? "secondary" : "default"}
          size="default"
          onClick={toggleActive}
          aria-label={isActive ? "Pausar cronômetro" : "Iniciar cronômetro"}
          className="flex-1 h-10 gap-1.5 font-semibold"
        >
          {isActive ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Iniciar</span>
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="default"
          onClick={() => addTime(30)}
          aria-label="Adicionar 30 segundos"
          className="px-3 h-10 text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-0.5" />
          30s
        </Button>
      </div>
    </div>
  );
}
