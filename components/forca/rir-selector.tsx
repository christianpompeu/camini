import { cn } from "@/lib/utils";

export interface RirSelectorProps {
  value?: number;
  onChange?: (value?: number) => void;
  className?: string;
}

const RIR_OPTIONS = [
  { val: 0, label: "0" },
  { val: 1, label: "1" },
  { val: 2, label: "2" },
  { val: 3, label: "3" },
  { val: 4, label: "4+" },
];

export function RirSelector({ value, onChange, className }: RirSelectorProps) {
  const getDescriptor = () => {
    if (value === undefined) return "Não informado (toque em um número para registrar)";
    if (value === 0) return "0 repetições na reserva (Falha concêntrica)";
    if (value === 1) return "1 repetição restante antes da falha";
    if (value === 4) return "4 ou mais repetições em reserva";
    return `${value} repetições restantes antes da falha`;
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          RIR (Repetições na Reserva)
        </span>
        {value !== undefined && (
          <button
            type="button"
            onClick={() => onChange?.(undefined)}
            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Limpar (Não informar)
          </button>
        )}
      </div>

      <div className="flex justify-between gap-1.5 w-full bg-slate-50 p-1.5 rounded-2xl dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
        {RIR_OPTIONS.map(({ val, label }) => {
          const isSelected = value === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => {
                // Se já estiver selecionado, permite desmarcar para 'não informado'
                if (isSelected) {
                  onChange?.(undefined);
                } else {
                  onChange?.(val);
                }
              }}
              className={cn(
                "flex-1 py-2.5 text-base sm:text-lg font-bold rounded-xl transition-all duration-200",
                isSelected
                  ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                  : "text-slate-600 bg-transparent hover:bg-slate-200/60 active:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:active:bg-slate-800"
              )}
              title={label}
            >
              {label}
            </button>
          );
        })}
      </div>

      <span className="text-[11px] text-muted-foreground text-center italic">
        {getDescriptor()}
      </span>
    </div>
  );
}

