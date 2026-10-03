"use client";

import React from "react";

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "active" | "energy" | "success" | "warning" | "outline";
  size?: "sm" | "md";
  interactive?: boolean;
}

export function Chip({
  children,
  className = "",
  variant = "default",
  size = "md",
  interactive = false,
  ...props
}: ChipProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-pill transition-all duration-150 select-none whitespace-nowrap";

  const sizeClasses = {
    sm: "px-3 py-1 text-xs gap-1.5",
    md: "px-4 py-1.5 text-sm gap-2 min-h-[36px]",
  };

  const interactiveClasses = interactive
    ? "tap-effect cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camini-cobalt"
    : "";

  const variantClasses = {
    default:
      "bg-surface-elevated text-text-secondary border border-outline",
    active:
      "bg-camini-cobalt text-white font-semibold shadow-sm",
    energy:
      "bg-gradient-camini text-white font-semibold shadow-sm",
    success:
      "bg-camini-aqua/15 text-camini-aqua border border-energy-green/30 font-semibold",
    warning:
      "bg-energy-amber/15 text-amber-500 border border-energy-amber/30 font-semibold",
    outline:
      "border border-outline text-text-secondary hover:border-camini-cobalt/50 hover:text-text-primary",
  };

  return (
    <div
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
