"use client";

import React from "react";
import Link from "next/link";
import { Cloud, CloudOff, RefreshCw, AlertCircle, LogIn, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SyncStatusBarProps {
  user: any | null;
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncError: string | null;
  onSync: () => void;
}

export function SyncStatusBar({
  user,
  isSyncing,
  lastSyncTime,
  syncError,
  onSync,
}: SyncStatusBarProps) {
  if (!user) {
    return (
      <div className="rounded-2xl border border-border/80 bg-muted/40 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="size-6 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
            <CloudOff className="size-3.5" />
          </div>
          <div>
            <span className="font-semibold text-foreground">Modo Local (Offline):</span>{" "}
            Seus carrinhos e fotos estão seguros no seu aparelho.
          </div>
        </div>

        <Link
          href="/login?next=/mercado"
          className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-background border border-border text-foreground hover:bg-accent font-semibold text-xs transition-colors shrink-0 shadow-2xs"
        >
          <LogIn className="size-3.5 text-primary" />
          <span>Fazer login para salvar na nuvem</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2">
        <div className="size-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          {isSyncing ? (
            <RefreshCw className="size-3.5 animate-spin" />
          ) : (
            <CheckCircle className="size-3.5" />
          )}
        </div>
        <div className="text-muted-foreground">
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">
            {isSyncing ? "Sincronizando com Supabase..." : "Nuvem Conectada:"}
          </span>{" "}
          Conta <span className="font-medium text-foreground">{user.email || "autenticada"}</span>
          {lastSyncTime && (
            <span className="hidden sm:inline text-muted-foreground/80">
              {" "}• Último envio às {new Date(lastSyncTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {syncError && (
          <span className="text-destructive font-medium flex items-center gap-1 text-[11px]">
            <AlertCircle className="size-3" /> Falha no envio
          </span>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSyncing}
          onClick={onSync}
          className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 bg-background hover:bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
        >
          <RefreshCw className={`size-3 ${isSyncing ? "animate-spin" : ""}`} />
          <span>Sincronizar agora</span>
        </Button>
      </div>
    </div>
  );
}
