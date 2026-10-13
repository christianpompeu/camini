"use client";

import React from "react";
import { WorkoutPlan, WorkoutDivision } from "@/types/workout-plan";
import { useWorkoutPlanStore } from "@/store/useWorkoutPlanStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Plus,
  Play,
  Edit,
  Copy,
  ChevronRight,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface WorkoutPlanListViewProps {
  onSelectDivision: (plan: WorkoutPlan, division: WorkoutDivision) => void;
  onEditPlan: (plan: WorkoutPlan) => void;
  onCreateNewPlan: () => void;
  onImportBaseline: () => void;
  onGoToCatalog?: () => void;
}

export function WorkoutPlanListView({
  onSelectDivision,
  onEditPlan,
  onCreateNewPlan,
  onImportBaseline,
  onGoToCatalog,
}: WorkoutPlanListViewProps) {
  const { plans, activePlanId, duplicatePlan, createNewVersionFromPlan } =
    useWorkoutPlanStore();

  const activePlan = plans.find((p) => p.id === activePlanId && p.status === "active") || null;
  const draftPlans = plans.filter((p) => p.status === "draft");
  const archivedPlans = plans.filter((p) => p.status === "archived");

  const handleDuplicate = (plan: WorkoutPlan) => {
    const dup = duplicatePlan(plan.id);
    if (dup) {
      onEditPlan(dup);
    }
  };

  const handleCreateNewVersion = (plan: WorkoutPlan) => {
    const newVersion = createNewVersionFromPlan(plan.id);
    if (newVersion) {
      onEditPlan(newVersion);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200 pb-16">
      {/* Cabeçalho de Minhas Fichas (Figma Tela 19) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Dumbbell className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">
              MINHAS FICHAS / PROGRAMAS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Uma base para continuar
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Gerencie suas fichas versionadas e selecione os treinos do dia.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onGoToCatalog && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onGoToCatalog}
              className="text-xs gap-1.5 h-9"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ver Catálogo</span>
            </Button>
          )}

          <Button
            type="button"
            onClick={onCreateNewPlan}
            className="text-xs font-semibold gap-1.5 h-9 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Ficha</span>
          </Button>
        </div>
      </div>

      {/* 1. FICHA ATIVA OFICIAL */}
      {activePlan ? (
        <div className="p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/30 bg-card shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                  {activePlan.name}
                </h2>
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[11px] font-semibold gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Ficha Ativa
                </Badge>
                <Badge variant="outline" className="text-[11px] font-mono">
                  v{activePlan.version}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {activePlan.goal || "Objetivo geral de força"} · {activePlan.divisions.length} treinos
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEditPlan(activePlan)}
                className="text-xs gap-1.5 h-8 font-medium"
              >
                <Edit className="w-3 h-3" />
                <span>Editar</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCreateNewVersion(activePlan)}
                className="text-xs gap-1.5 h-8 font-medium"
              >
                <Sparkles className="w-3 h-3 text-primary" />
                <span>Nova Versão</span>
              </Button>
            </div>
          </div>

          {/* Lista de Divisões do Treino Ativo (Figma Tela 19) */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Divisões de Treino (Toque para ver a prescrição e iniciar)
            </span>

            <div className="grid grid-cols-1 gap-2.5">
              {activePlan.divisions.map((div) => (
                <div
                  key={div.id}
                  onClick={() => onSelectDivision(activePlan, div)}
                  className="p-4 rounded-xl border border-border bg-muted/10 hover:border-foreground/25 hover:bg-muted/20 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-base shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <span>{div.letter || "•"}</span>
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                        {div.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {div.prescribedExercises.length} exercícios ·{" "}
                        {div.notes || "metas disponíveis"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      className="text-xs gap-1.5 h-8 font-semibold"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Ver Ficha</span>
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Caso não haja nenhuma ficha pessoal ativada */
        <div className="p-8 text-center border-2 border-dashed border-border rounded-2xl bg-card space-y-4">
          <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground/40 stroke-[1.5]" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Nenhuma Ficha Pessoal Ativada
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Você pode importar o programa canônico A–E como rascunho para começar ou criar uma ficha do zero com seus próprios exercícios.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <Button
              type="button"
              onClick={onImportBaseline}
              className="text-xs gap-1.5 h-9 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Criar rascunho dos treinos A–E</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCreateNewPlan}
              className="text-xs gap-1.5 h-9"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar ficha do zero</span>
            </Button>
          </div>
        </div>
      )}

      {/* 2. RASCUNHOS EM ANDAMENTO */}
      {draftPlans.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-bold uppercase tracking-wider">
              Rascunhos em Edição ({draftPlans.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {draftPlans.map((draft) => (
              <div
                key={draft.id}
                className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-foreground truncate">
                      {draft.name}
                    </h4>
                    <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                      Rascunho
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      v{draft.version}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {draft.divisions.length} {draft.divisions.length === 1 ? "divisão" : "divisões"} ·{" "}
                    {draft.notes || "Não ativada"}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => onEditPlan(draft)}
                    className="text-xs gap-1.5 h-8 font-semibold"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Continuar editando</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(draft)}
                    className="text-xs gap-1 h-8"
                    title="Duplicar rascunho"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. FICHAS E VERSÕES ARQUIVADAS */}
      {archivedPlans.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-semibold uppercase tracking-wider">
              Versões Arquivadas / Históricas ({archivedPlans.length})
            </span>
          </div>

          <div className="space-y-2">
            {archivedPlans.map((archived) => (
              <div
                key={archived.id}
                className="p-3.5 rounded-xl border border-border/70 bg-muted/10 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground truncate">{archived.name}</span>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      v{archived.version}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {archived.divisions.length} divisões · Arquivada
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(archived)}
                    className="text-xs gap-1 h-7 text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Criar cópia</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
