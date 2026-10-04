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
      <div className={`h-8 w-8 rounded-md border border-input bg-background/50 ${className}`} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors shadow-xs ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-200" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-200" />
      )}
    </button>
  );
}
