"use client";

import React, { forwardRef } from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "glass" | "outline" | "active";
  radius?: "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = "",
      variant = "elevated",
      radius = "lg",
      interactive = false,
      ...props
    },
    ref
  ) => {
    const baseClasses = "transition-all duration-200";

    const variantClasses = {
      elevated:
        "bg-surface-elevated card-elevation border border-outline text-text-primary",
      glass:
        "glass-surface text-text-primary",
      outline:
        "bg-transparent border border-outline text-text-primary",
      active:
        "bg-surface-elevated border-2 border-energy-blue text-text-primary shadow-lg shadow-energy-blue/10",
    };

    const radiusClasses = {
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
    };

    const interactiveClasses = interactive
      ? "tap-effect cursor-pointer hover:border-energy-blue/40"
      : "";

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${radiusClasses[radius]} ${interactiveClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
