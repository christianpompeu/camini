import { cn } from "@/lib/utils";
import { Play, RotateCcw, Pause } from "lucide-react";

export interface TimerCardProps {
  timeRemaining: string;
  status: "Ativo" | "Pausado";
  onReset?: () => void;
  onToggle?: () => void;
  onAdd30s?: () => void;
  className?: string;
}

export function TimerCard({
  timeRemaining,
  status,
  onReset,
  onToggle,
  onAdd30s,
  className,
}: TimerCardProps) {
  const isActive = status === "Ativo";

  return (
    <div
      className={cn(
        "flex flex-col items-center bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800",
        className
      )}
    >
      <div className="flex flex-col items-center mb-6">
        <span
          className={cn(
            "text-sm font-semibold tracking-widest uppercase mb-2 transition-colors",
            isActive
              ? "text-green-600 dark:text-green-400"
              : "text-amber-500 dark:text-amber-400"
          )}
        >
          {status}
        </span>
        <span className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums">
          {timeRemaining}
        </span>
      </div>

      <div className="flex items-center gap-3 w-full justify-center">
        <button
          onClick={onReset}
          className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 text-slate-500 active:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:active:bg-slate-700"
          aria-label="Resetar"
        >
          <RotateCcw size={24} strokeWidth={2.5} />
        </button>

        <button
          onClick={onToggle}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-16 max-w-[120px] rounded-2xl text-white font-bold text-lg shadow-md transition-transform active:scale-95",
            isActive
              ? "bg-slate-900 dark:bg-white dark:text-slate-900"
              : "bg-green-600 hover:bg-green-700 dark:bg-green-500"
          )}
        >
          {isActive ? (
            <Pause size={28} strokeWidth={3} className="fill-current" />
          ) : (
            <Play size={28} strokeWidth={3} className="fill-current ml-1" />
          )}
        </button>

        <button
          onClick={onAdd30s}
          className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 text-slate-700 font-black text-sm active:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:active:bg-slate-700"
        >
          +30s
        </button>
      </div>
    </div>
  );
}
