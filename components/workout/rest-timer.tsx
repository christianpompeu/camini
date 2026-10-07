"use client";

import React, { useState, useEffect } from "react";
import { TimerCard } from "@/components/forca/timer-card";
import { useWorkoutStore } from "@/store/useWorkoutStore";

export interface RestTimerProps {
  className?: string;
}

export function RestTimer({ className = "" }: RestTimerProps) {
  const { restTimer, startTimer, pauseTimer, resumeTimer, skipTimer, addTime, recalculateTimer } = useWorkoutStore();
  const [timeLeft, setTimeLeft] = useState(restTimer.durationMs);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        recalculateTimer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [recalculateTimer]);

  useEffect(() => {
    if (restTimer.status === "idle" || restTimer.status === "finished") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(restTimer.status === "finished" ? 0 : restTimer.durationMs);
      return;
    }

    if (restTimer.status === "paused" && restTimer.remainingMsWhenPaused !== null) {
      setTimeLeft(restTimer.remainingMsWhenPaused);
      return;
    }

    if (restTimer.status === "running" && restTimer.endsAt) {
      const calculateTime = () => {
        const remaining = Math.max(0, restTimer.endsAt! - Date.now());
        setTimeLeft(remaining);
        if (remaining <= 0) {
          recalculateTimer();
        }
      };

      calculateTime();
      const interval = setInterval(calculateTime, 100);
      return () => clearInterval(interval);
    }
  }, [restTimer.status, restTimer.endsAt, restTimer.remainingMsWhenPaused, restTimer.durationMs, recalculateTimer]);

  const toggleActive = () => {
    if (restTimer.status === "running") {
      pauseTimer();
    } else if (restTimer.status === "paused") {
      resumeTimer();
    } else {
      startTimer(timeLeft > 0 ? Math.ceil(timeLeft / 1000) : 90);
    }
  };

  const totalSeconds = Math.ceil(timeLeft / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progress = restTimer.durationMs > 0 
    ? (restTimer.durationMs - timeLeft) / restTimer.durationMs 
    : 0;

  // Adapt state string for TimerCard which expects "Ativo" | "Pausado" (or we pass it loosely if typing allows)
  let statusText: "Ativo" | "Pausado" | "Concluído" | "Ocioso" = "Ocioso";
  if (restTimer.status === "running") statusText = "Ativo";
  else if (restTimer.status === "paused") statusText = "Pausado";
  else if (restTimer.status === "finished") statusText = "Concluído";

  return (
    <TimerCard
      timeRemaining={formattedTime}
      status={statusText as "Ativo" | "Pausado"}
      progress={progress}
      onReset={() => skipTimer()} // Pular encerra
      onToggle={toggleActive}
      onAdd30s={() => addTime(30)}
      className={className}
    />
  );
}

