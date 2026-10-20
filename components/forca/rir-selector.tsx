import React from "react";
import { cn } from "@/lib/utils";

export interface RirSelectorProps {
  value?: number;
  onChange?: (value?: number) => void;
  className?: string;
}

const RIR_OPTIONS: Array<{ val: number | undefined; label: string; ariaLabel: string }> = [
  { val: 0, label: "0", ariaLabel: "0 repetições na reserva (falha)" },
  { val: 1, label: "1", ariaLabel: "1 repetição na reserva" },
  { val: 2, label: "2", ariaLabel: "2 repetições na reserva" },
  { val: 3, label: "3", ariaLabel: "3 repetições na reserva" },
  { val: 4, label: "4+", ariaLabel: "4 ou mais repetições na reserva" },
  { val: undefined, label: "—", ariaLabel: "Não informado / Sem RIR" },
];

export function RirSelector({ value, onChange, className }: RirSelectorProps) {
  const getDescriptor = () => {
    if (value === undefined) return "Não informado (toque em um número para registrar)";
    if (value === 0) return "0 repetições na reserva (falha concêntrica)";
    if (value === 1) return "1 repetição restante antes da falha";
    if (value === 4) return "4 ou mais repetições em reserva";
    return `${value} repetições restantes antes da falha`;
  };

  return (
    <section className={cn("space-y-2 pt-1", className)} data-purpose="rir-selector">
      <div className="flex items-center justify-between px-0.5">
        <label className="block text-[13px] font-medium text-zinc-500 dark:text-zinc-400 tracking-tight">
          Repetições em reserva (RIR)
        </label>
        {value !== undefined && (
          <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
            RIR {value === 4 ? "4+" : value}
          </span>
        )}
      </div>

      <div className="grid grid-cols-6 gap-2">
        {RIR_OPTIONS.map(({ val, label, ariaLabel }) => {
          const isSelected = val === undefined ? value === undefined : value === val;

          return (
            <button
              key={label}
              type="button"
              aria-label={ariaLabel}
              onClick={() => {
                if (val === undefined) {
                  onChange?.(undefined);
                } else if (value === val) {
                  onChange?.(undefined);
                } else {
                  onChange?.(val);
                }
              }}
              className={cn(
                "h-12 sm:h-13 py-2.5 rounded-xl font-semibold text-base sm:text-lg transition-all duration-150 flex items-center justify-center select-none active:scale-95 cursor-pointer",
                isSelected
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                  : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center italic tracking-tight">
        {getDescriptor()}
      </p>
    </section>
  );
}


