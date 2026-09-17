"use client";

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (onFinish) onFinish();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onFinish]);

  const toggleActive = () => setIsActive(!isActive);

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
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div
      className={`relative p-6 rounded-xl border border-outline bg-surface-elevated card-elevation flex flex-col items-center justify-center ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-energy-blue" />
        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
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
            className="text-outline/40"
          />
          {/* Anel com gradiente progress */}
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5B7CFA" />
              <stop offset="50%" stopColor="#41C7D9" />
              <stop offset="100%" stopColor="#52B788" />
            </linearGradient>
          </defs>
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="url(#timerGrad)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Display do Tempo em Destaque */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-text-primary tracking-tight font-mono">
            {formattedTime}
          </span>
          <span className="text-xs font-semibold text-text-secondary mt-1">
            {isActive ? "Em andamento" : timeLeft === 0 ? "Tempo esgotado!" : "Pausado"}
          </span>
        </div>
      </div>

      {/* Controles de Cronômetro */}
      <div className="flex items-center gap-3 mt-4 w-full max-w-xs">
        <Button
          variant="secondary"
          size="md"
          onClick={resetTimer}
          aria-label="Reiniciar cronômetro"
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>

        <Button
          variant={isActive ? "secondary" : "energy"}
          size="md"
          onClick={toggleActive}
          aria-label={isActive ? "Pausar cronômetro" : "Iniciar cronômetro"}
          className="flex-1 shadow-md shadow-energy-blue/15"
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4" />
              Pausar
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              Iniciar
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={() => addTime(30)}
          aria-label="Adicionar 30 segundos"
          className="px-3"
        >
          <Plus className="w-3.5 h-3.5" />
          30s
        </Button>
      </div>
    </div>
  );
}
