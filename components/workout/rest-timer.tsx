"use client";

import React, { useState, useEffect, useRef } from "react";
import { TimerCard } from "@/components/forca/timer-card";

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

  const progress = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;

  return (
    <TimerCard
      timeRemaining={formattedTime}
      status={isActive ? "Ativo" : "Pausado"}
      progress={progress}
      onReset={resetTimer}
      onToggle={toggleActive}
      onAdd30s={() => addTime(30)}
      className={className}
    />
  );
}
