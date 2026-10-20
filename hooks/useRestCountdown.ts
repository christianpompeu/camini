"use client";

import { useState, useEffect, useCallback } from "react";
import { useWorkoutStore } from "@/store/useWorkoutStore";

export function useRestCountdown() {
  const { restTimer, startTimer, pauseTimer, resumeTimer, skipTimer, addTime, recalculateTimer } =
    useWorkoutStore();

  const [tickerNow, setTickerNow] = useState(() => Date.now());

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        recalculateTimer();
        setTickerNow(Date.now());
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [recalculateTimer]);

  useEffect(() => {
    if (restTimer.status !== "running") return;

    const interval = setInterval(() => {
      const now = Date.now();
      setTickerNow(now);
      if (restTimer.endsAt && restTimer.endsAt - now <= 0) {
        recalculateTimer();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [restTimer.status, restTimer.endsAt, recalculateTimer]);

  // Derivação pura sem cascading renders
  const timeLeftMs =
    restTimer.status === "finished"
      ? 0
      : restTimer.status === "idle"
      ? restTimer.durationMs
      : restTimer.status === "paused"
      ? restTimer.remainingMsWhenPaused ?? restTimer.durationMs
      : restTimer.endsAt
      ? Math.max(0, restTimer.endsAt - tickerNow)
      : restTimer.durationMs;

  const togglePause = useCallback(() => {
    if (restTimer.status === "running") {
      pauseTimer();
    } else if (restTimer.status === "paused") {
      resumeTimer();
    } else {
      startTimer(timeLeftMs > 0 ? Math.ceil(timeLeftMs / 1000) : 90);
    }
  }, [restTimer.status, pauseTimer, resumeTimer, startTimer, timeLeftMs]);

  const add30Seconds = useCallback(() => {
    addTime(30);
  }, [addTime]);

  const skipRest = useCallback(() => {
    skipTimer();
  }, [skipTimer]);

  const totalSeconds = Math.ceil(timeLeftMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isTimerRunning = restTimer.status === "running";
  const isPaused = restTimer.status === "paused";
  const isFinished = restTimer.status === "finished";

  return {
    timeLeftMs,
    formattedTime,
    status: restTimer.status,
    isTimerRunning,
    isPaused,
    isFinished,
    togglePause,
    add30Seconds,
    skipRest,
  };
}
