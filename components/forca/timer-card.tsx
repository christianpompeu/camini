import { cn } from "@/lib/utils";
import { Play, RotateCcw, Pause } from "lucide-react";

export interface TimerCardProps {
  timeRemaining: string;
  status: "Ativo" | "Pausado";
  progress?: number;
  onReset?: () => void;
  onToggle?: () => void;
  onAdd30s?: () => void;
  className?: string;
}

export function TimerCard({
  timeRemaining,
  status,
  progress = 0,
  onReset,
  onToggle,
  onAdd30s,
  className,
}: TimerCardProps) {
  const isActive = status === "Ativo";
  const radius = 70;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div
      className={cn(
        "flex flex-col items-center bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800",
        className
      )}
    >
      <div className="relative flex flex-col items-center justify-center w-56 h-56 mb-4">
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90"
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
            className="text-slate-100 dark:text-slate-800"
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
            className="text-slate-900 dark:text-white transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="flex flex-col items-center z-10 mt-2">
          <span
            className={cn(
              "text-xs font-semibold tracking-widest uppercase mb-1 transition-colors",
              isActive
                ? "text-slate-900 dark:text-white"
                : "text-slate-400 dark:text-slate-500"
            )}
          >
            {status}
          </span>
          <span className="text-5xl sm:text-6xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums">
            {timeRemaining}
          </span>
        </div>
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
            "flex flex-col items-center justify-center flex-1 h-16 max-w-[120px] rounded-2xl font-bold text-lg transition-transform active:scale-95",
            isActive
              ? "bg-transparent border-2 border-slate-900 text-slate-900 dark:border-white dark:text-white"
              : "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
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
