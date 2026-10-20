import React from "react";
import { cn } from "@/lib/utils";

export interface NumberStepperProps {
  value: number;
  label?: string;
  onIncrement?: () => void;
  onDecrement?: () => void;
  unit?: string;
  className?: string;
  min?: number;
}

export function NumberStepper({
  value,
  label,
  onIncrement,
  onDecrement,
  unit,
  className,
  min = 0,
}: NumberStepperProps) {
  const isAtMin = value <= min;

  return (
    <section
      className={cn(
        "border border-zinc-200 dark:border-zinc-800 rounded-[20px] p-4 bg-white dark:bg-zinc-900/80 shadow-xs transition-colors",
        className
      )}
    >
      {label && (
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 tracking-tight">
          {label} {unit && !label.includes(unit) ? `· ${unit}` : ""}
        </label>
      )}
      <div className="flex items-center justify-between px-1 py-0.5">
        <button
          type="button"
          onClick={onDecrement}
          disabled={isAtMin}
          aria-label={`Diminuir ${label || "valor"}`}
          className={cn(
            "w-11 h-11 flex items-center justify-center text-3xl font-light rounded-xl transition-all duration-150 select-none",
            isAtMin
              ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-50"
              : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 cursor-pointer"
          )}
        >
          −
        </button>

        <div className="flex items-baseline justify-center gap-1.5 px-2 select-none">
          <span className="text-[44px] font-extrabold tracking-tight text-zinc-950 dark:text-white leading-none tabular-nums">
            {value}
          </span>
          {unit && label && !label.includes(unit) && (
            <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">
              {unit}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onIncrement}
          aria-label={`Aumentar ${label || "valor"}`}
          className="w-11 h-11 flex items-center justify-center text-3xl font-light text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl active:scale-95 transition-all duration-150 cursor-pointer select-none"
        >
          +
        </button>
      </div>
    </section>
  );
}

