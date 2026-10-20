"use client";

import React from "react";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExportDataPanel } from "@/components/workout/export-data-panel";

export interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRestSeconds: number;
  onUpdateDefaultRest: (seconds: number) => void;
}

export function SettingsDialog({
  isOpen,
  onClose,
  defaultRestSeconds = 90,
  onUpdateDefaultRest,
}: SettingsDialogProps) {
  const restOptions = [60, 90, 120, 180];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[95vw] rounded-2xl p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="text-left pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <Settings className="w-4 h-4 text-zinc-950 dark:text-white" />
            <span>Preferências</span>
          </div>
          <DialogTitle className="text-xl font-bold text-zinc-950 dark:text-white pt-0.5">
            Ajustes do FORÇA
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Configure o comportamento do cronômetro, persistência e exportação de treinos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Tempo de Descanso Padrão */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-800 dark:text-zinc-200">
                Tempo padrão de descanso
              </label>
              <span className="text-[11px] text-zinc-400">Ao concluir série</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {restOptions.map((sec) => {
                const isSelected = defaultRestSeconds === sec;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => onUpdateDefaultRest(sec)}
                    className={`py-2 rounded-xl text-center font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-2xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                    }`}
                  >
                    {sec}s
                  </button>
                );
              })}
            </div>
          </section>

          {/* Armazenamento Local */}
          <section className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-[#F5F5F7] dark:bg-zinc-800/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-900 dark:text-white">
                Armazenamento Offline-first
              </span>
              <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600">
                Ativo
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Todos os seus registros de treinos, rascunhos e históricos são gravados localmente neste aparelho.
            </p>
          </section>

          {/* Painel de Exportação JSON / CSV */}
          <section className="pt-1">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mb-2">
              Exportação e Backup de Dados
            </span>
            <ExportDataPanel />
          </section>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            onClick={onClose}
            className="w-full bg-zinc-950 hover:bg-black text-white dark:bg-white dark:text-zinc-950 font-semibold rounded-xl h-11"
          >
            Concluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
