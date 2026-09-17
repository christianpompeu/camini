"use client";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rounded" | "pill" | "circle" | "card";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = "",
  variant = "rounded",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    rounded: "rounded-md",
    pill: "rounded-pill",
    circle: "rounded-full",
    card: "rounded-xl",
  };

  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer ${variantClasses[variant]} ${className}`}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      {...props}
    />
  );
}

/* ==========================================================================
   SKELETONS ESPECÍFICOS DO DOMÍNIO (TREINO & APLICAÇÕES)
   ========================================================================== */

export function WorkoutCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-outline bg-surface-elevated p-6 card-elevation space-y-5 animate-in fade-in duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="rounded" className="w-12 h-12 rounded-lg shrink-0" />
          <div className="space-y-2">
            <Skeleton className="w-40 h-5" />
            <Skeleton className="w-28 h-3.5" />
          </div>
        </div>
        <Skeleton variant="pill" className="w-16 h-7" />
      </div>

      <div className="flex items-center gap-4 pt-3 border-t border-outline/50">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-28 h-4" />
      </div>

      <Skeleton variant="rounded" className="w-full h-12 rounded-md" />
    </div>
  );
}

export function ActiveSetCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-outline bg-surface-elevated card-elevation space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Skeleton */}
      <div className="px-6 py-4 border-b border-outline/50 bg-surface/30 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="w-28 h-3.5" />
          <Skeleton className="w-48 h-6" />
        </div>
        <Skeleton variant="pill" className="w-16 h-6" />
      </div>

      {/* Grid de Métricas */}
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>

        {/* RIR selector skeleton */}
        <Skeleton className="h-12 rounded-lg" />

        {/* Action button skeleton */}
        <Skeleton variant="rounded" className="w-full h-14 rounded-lg" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-xl border border-outline bg-surface-elevated card-elevation space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-3.5" />
        <Skeleton variant="circle" className="w-8 h-8" />
      </div>
      <Skeleton className="w-20 h-8" />
      <Skeleton className="w-36 h-3" />
    </div>
  );
}
