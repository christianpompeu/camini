"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useNutreTheme, type NutreThemePreference } from "./nutre-theme-provider";

const options: Array<{ value: NutreThemePreference; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

export function NutreThemeToggle() {
  const { preference, setPreference } = useNutreTheme();

  return (
    <div className="nutre-theme-toggle" role="group" aria-label="Tema do Nutre">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={preference === value}
          onClick={() => setPreference(value)}
          title={`Tema ${label}`}
          className={preference === value ? "is-active" : undefined}
        >
          <Icon aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
