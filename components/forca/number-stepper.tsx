import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

export interface NumberStepperProps {
  value: number;
  label?: string;
  onIncrement?: () => void;
  onDecrement?: () => void;
  unit?: string;
  className?: string;
}

export function NumberStepper({
  value,
  label,
  onIncrement,
  onDecrement,
  unit,
  className,
}: NumberStepperProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {label && (
        <span className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
      )}
      <div className="flex items-center justify-between w-full max-w-[240px] bg-white border-2 border-slate-100 rounded-2xl p-2 dark:bg-slate-900 dark:border-slate-800">
        <button
          onClick={onDecrement}
          className="w-12 h-12 flex shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 active:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:active:bg-slate-700"
          aria-label="Diminuir"
        >
          <Minus size={24} strokeWidth={2.5} />
        </button>
        <div className="flex items-baseline justify-center flex-1 gap-1 px-2 overflow-hidden">
          <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
            {value}
          </span>
          {unit && (
            <span className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400 truncate">
              {unit}
            </span>
          )}
        </div>
        <button
          onClick={onIncrement}
          className="w-12 h-12 flex shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 active:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:active:bg-slate-700"
          aria-label="Aumentar"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
