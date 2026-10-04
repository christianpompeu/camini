"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, WifiOff, X } from "lucide-react";
import { Alert, AlertTitle, AlertDescription, AlertAction } from "./alert";
import { Badge } from "./badge";
import { Button } from "./button";

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
      containerClass: "bg-camini-aqua/10 border-energy-green/30 text-text-primary",
      iconColor: "text-camini-aqua",
      badgeVariant: "success" as const,
      badgeText: "Concluído",
    },
    warning: {
      icon: AlertTriangle,
      containerClass: "bg-amber-500/10 border-amber-500/30 text-text-primary",
      iconColor: "text-amber-500",
      badgeVariant: "warning" as const,
      badgeText: "Atenção",
    },
    offline: {
      icon: WifiOff,
      containerClass: "bg-surface-elevated border-outline text-text-primary",
      iconColor: "text-text-secondary",
      badgeVariant: "default" as const,
      badgeText: "Offline",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Alert className={`${config.containerClass} ${className} items-start`}>
      <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5`} />
      <div className="flex-1 min-w-0">
        <AlertTitle className="flex items-center gap-2 m-0 p-0">
          <span className="font-semibold text-sm tracking-tight">{title}</span>
          <Badge variant={config.badgeVariant} size="sm" className="px-2 py-0.5 text-[11px] font-bold">
            {config.badgeText}
          </Badge>
        </AlertTitle>
        {description && (
          <AlertDescription className="mt-1 text-xs text-text-secondary leading-relaxed">
            {description}
          </AlertDescription>
        )}
      </div>
      {onClose && (
        <AlertAction>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fechar notificação"
            className="w-6 h-6 rounded-pill text-text-secondary hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </Button>
        </AlertAction>
      )}
    </Alert>
  );
}
