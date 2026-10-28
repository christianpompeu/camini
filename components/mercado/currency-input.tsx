"use client";

import React, { useState, useEffect } from "react";
import { formatCentsInput, parseCentsFromDigits, decimalToCents, centsToDecimal } from "@/lib/mercado/utils";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value: number; // Valor decimal em reais (ex: 12.50)
  onChange: (decimalValue: number) => void;
  className?: string;
  placeholder?: string;
  id?: string;
  autoFocus?: boolean;
}

/**
 * Campo de entrada monetária em Reais (BRL) estilo caixa registradora.
 * Não requer que o usuário digite vírgula: a aplicação posiciona os centavos automaticamente.
 * Digitar 1 -> 0,01
 * Digitar 15 -> 0,15
 * Digitar 150 -> 1,50
 * Digitar 1500 -> 15,00
 */
export function CurrencyInput({
  value,
  onChange,
  className,
  placeholder = "0,00",
  id,
  autoFocus = false,
}: CurrencyInputProps) {
  const [cents, setCents] = useState<number>(() => decimalToCents(value || 0));

  useEffect(() => {
    const currentCents = decimalToCents(value || 0);
    if (currentCents !== cents) {
      setCents(currentCents);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const newCents = parseCentsFromDigits(rawValue);
    setCents(newCents);
    onChange(centsToDecimal(newCents));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Tecla Backspace com zero já limpa
    if (e.key === "Backspace" && cents === 0) {
      e.preventDefault();
    }
  };

  const displayString = formatCentsInput(cents);

  return (
    <div className="relative flex items-center w-full">
      <span className="absolute left-3.5 text-xs font-semibold text-muted-foreground select-none pointer-events-none">
        R$
      </span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        id={id}
        autoFocus={autoFocus}
        value={cents === 0 ? "" : displayString}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-12 w-full rounded-xl border border-input bg-background pl-10 pr-3.5 text-base font-semibold text-foreground tracking-tight transition-all",
          "placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          className
        )}
      />
    </div>
  );
}
