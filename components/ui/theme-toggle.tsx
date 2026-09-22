"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const stored = localStorage.getItem("forca-theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("forca-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("forca-theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div className={`w-11 h-11 rounded-pill bg-surface-elevated border border-outline ${className}`} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
      className={`relative inline-flex items-center justify-center w-11 h-11 rounded-pill bg-surface-elevated border border-outline text-text-primary tap-effect shadow-sm hover:border-energy-blue/50 ${className}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-energy-amber transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-energy-violet transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}
