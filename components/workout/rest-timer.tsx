"use client";

import React, { useState, useEffect } from "react";
import { TimerCard } from "@/components/forca/timer-card";
import { useWorkoutStore } from "@/store/useWorkoutStore";

export interface RestTimerProps {
  className?: string;
}

export function RestTimer({ className = "" }: RestTimerProps) {
  const { restTimer, startTimer, stopTimer, addTime } = useWorkoutStore();
  const [timeLeft, setTimeLeft] = useState(restTimer.durationSeconds);

  // Calcula o tempo restante baseado no timestamp
  useEffect(() => {
    if (!restTimer.isActive || !restTimer.startTime) {
      setTimeLeft(restTimer.durationSeconds);
      return;
    }

    const calculateTime = () => {
      const elapsed = Math.floor((Date.now() - restTimer.startTime!) / 1000);
      const remaining = Math.max(0, restTimer.durationSeconds - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        stopTimer(); // Auto-stop when reaching 0
      }
    };

    // Atualiza a tela a cada segundo (apenas visual, a fonte da verdade é o Date.now())
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    
    return () => clearInterval(interval);
  }, [restTimer.isActive, restTimer.startTime, restTimer.durationSeconds, stopTimer]);

  const toggleActive = () => {
    if (restTimer.isActive) {
      stopTimer();
    } else {
      startTimer(timeLeft > 0 ? timeLeft : 90);
    }
  };

  const resetTimer = () => {
    stopTimer();
    startTimer(90); // Default 90s
    setTimeout(() => stopTimer(), 10); // Start and stop immediately to reset to 90
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progress = restTimer.durationSeconds > 0 
    ? (restTimer.durationSeconds - timeLeft) / restTimer.durationSeconds 
    : 0;

  return (
    <TimerCard
      timeRemaining={formattedTime}
      status={restTimer.isActive ? "Ativo" : "Pausado"}
      progress={progress}
      onReset={resetTimer}
      onToggle={toggleActive}
      onAdd30s={() => addTime(30)}
      className={className}
    />
  );
}

