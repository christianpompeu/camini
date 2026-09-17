"use client";

import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, id, className = "", ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary select-none"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`min-h-[48px] px-4 py-2.5 rounded-md bg-surface border text-text-primary placeholder:text-text-secondary/60 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-energy-blue focus-visible:border-transparent ${
            error
              ? "border-energy-coral focus-visible:ring-energy-coral"
              : "border-outline hover:border-text-secondary/40"
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-energy-coral font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-text-secondary">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
