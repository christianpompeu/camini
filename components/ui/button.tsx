"use client";

import React, { forwardRef } from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "energy" | "secondary" | "outline" | "ghost" | "effort" | "coral";
  size?: "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "energy",
      size = "md",
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base classes: minimum touch target of 44px for accessibility (WCAG AA), motion scale
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-all duration-150 select-none tap-effect focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-energy-blue focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variantClasses = {
      energy:
        "bg-gradient-energy text-white font-semibold shadow-md hover:brightness-105 active:brightness-95",
      secondary:
        "bg-surface-elevated text-text-primary border border-outline hover:bg-surface-elevated/90 dark:hover:bg-surface-elevated/70",
      outline:
        "border border-outline text-text-primary hover:bg-energy-blue/10 hover:border-energy-blue hover:text-energy-blue",
      ghost:
        "text-text-secondary hover:text-text-primary hover:bg-surface-elevated/60",
      effort:
        "bg-gradient-effort text-white font-semibold shadow-md hover:brightness-105",
      coral:
        "bg-energy-coral text-white font-semibold hover:brightness-105",
    };

    const sizeClasses = {
      sm: "min-h-[44px] px-4 py-2 text-sm rounded-md gap-1.5",
      md: "min-h-[48px] px-6 py-2.5 text-base rounded-md gap-2",
      lg: "min-h-[56px] px-8 py-3 text-lg font-semibold rounded-lg gap-2.5",
      icon: "min-h-[44px] min-w-[44px] p-2.5 rounded-pill",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
