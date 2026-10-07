import { cn } from "@/lib/utils";

export interface RirSelectorProps {
  value?: number;
  onChange?: (value: number) => void;
  className?: string;
}

const RIR_OPTIONS = [0, 1, 2, 3];

export function RirSelector({ value, onChange, className }: RirSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-semibold tracking-wide text-muted-foreground uppercase text-center">
        RIR (Repetições na Reserva)
      </span>
      <div className="flex justify-between gap-2 w-full max-w-[300px] mx-auto bg-slate-50 p-2 rounded-2xl dark:bg-slate-900">
        {RIR_OPTIONS.map((option) => {
          const isSelected = value === option;
          return (
            <button
              key={option}
              onClick={() => onChange?.(option)}
              className={cn(
                "flex-1 py-3 text-lg font-bold rounded-xl transition-all duration-200",
                isSelected
                  ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                  : "text-slate-500 bg-transparent active:bg-slate-200 dark:text-slate-400 dark:active:bg-slate-800"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
