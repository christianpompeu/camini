"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type NutreThemePreference = "light" | "dark" | "system";

interface NutreThemeContextValue {
  preference: NutreThemePreference;
  setPreference: (preference: NutreThemePreference) => void;
}

const NutreThemeContext = createContext<NutreThemeContextValue | null>(null);

function applyTheme(preference: NutreThemePreference) {
  const isDark =
    preference === "dark" ||
    (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.nutreTheme = isDark ? "dark" : "light";
}

export function NutreThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<NutreThemePreference>("system");

  useEffect(() => {
    const stored = localStorage.getItem("nutre-theme");
    const initial = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    // Reconciles the client-only preference after the no-flash initializer ran.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreferenceState(initial);
    applyTheme(initial);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystem = () => {
      if ((localStorage.getItem("nutre-theme") || "system") === "system") applyTheme("system");
    };
    media.addEventListener("change", updateSystem);
    return () => media.removeEventListener("change", updateSystem);
  }, []);

  const value = useMemo(
    () => ({
      preference,
      setPreference: (next: NutreThemePreference) => {
        localStorage.setItem("nutre-theme", next);
        setPreferenceState(next);
        applyTheme(next);
      },
    }),
    [preference]
  );

  return <NutreThemeContext.Provider value={value}>{children}</NutreThemeContext.Provider>;
}

export function useNutreTheme() {
  const value = useContext(NutreThemeContext);
  if (!value) throw new Error("useNutreTheme deve ser usado dentro de NutreThemeProvider");
  return value;
}
