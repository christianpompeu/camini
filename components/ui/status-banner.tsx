"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, WifiOff, X } from "lucide-react";

export interface StatusBannerProps {
  status: "success" | "warning" | "offline";
  title: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

export function StatusBanner({
  status,
  title,
  description,
  onClose,
  className = "",
}: StatusBannerProps) {
  const configs = {
    success: {
      icon: CheckCircle2,
      container:
        "bg-energy-green/10 border-energy-green/30 text-text-primary",
      iconColor: "text-energy-green",
      badge: "bg-energy-green text-white",
      badgeText: "Concluído",
    },
    warning: {
      icon: AlertTriangle,
      container:
        "bg-energy-amber/10 border-energy-amber/30 text-text-primary",
      iconColor: "text-energy-amber",
      badge: "bg-energy-amber text-black",
      badgeText: "Atenção",
    },
    offline: {
      icon: WifiOff,
      container:
        "bg-surface-elevated border-outline text-text-primary",
      iconColor: "text-text-secondary",
      badge: "bg-text-secondary text-white",
      badgeText: "Offline",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3.5 p-4 rounded-lg border card-elevation transition-all ${config.container} ${className}`}
    >
      <div className={`mt-0.5 p-1 rounded-full ${config.iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-tight">{title}</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-pill ${config.badge}`}>
            {config.badgeText}
          </span>
        </div>
        {description && (
          <p className="mt-1 text-xs text-text-secondary leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Fechar notificação"
          className="p-1 rounded-pill text-text-secondary hover:text-text-primary hover:bg-surface tap-effect"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
