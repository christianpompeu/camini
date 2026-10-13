"use client";

import React, { useState } from "react";
import { WorkoutPlan, WorkoutPlanDiff, validateWorkoutPlanForActivation } from "@/types/workout-plan";
import { useWorkoutPlanStore } from "@/store/useWorkoutPlanStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface WorkoutPlanReviewViewProps {
  plan: WorkoutPlan;
  onBack: () => void;
  onActivateSuccess: (activated: WorkoutPlan) => void;
}

export function WorkoutPlanReviewView({
  plan,
  onBack,
  onActivateSuccess,
}: WorkoutPlanReviewViewProps) {
  const { activatePlan, getDiffWithPreviousVersion } = useWorkoutPlanStore();
  const [versionReason, setVersionReason] = useState(plan.versionReason || "");
  const [isActivating, setIsActivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calcula diff com versão anterior (se houver)
  const diff: WorkoutPlanDiff | null = getDiffWithPreviousVersion(plan);

  // Validação dos requisitos mínimos para ativação
  const validation = validateWorkoutPlanForActivation(plan);

  const handleActivate = () => {
    setIsActivating(true);
    setErrorMessage(null);

    const result = activatePlan(plan.id, versionReason);
    setIsActivating(false);

    if (result.success) {
      onActivateSuccess(plan);
    } else {
      setErrorMessage(
        result.validation.errors[0] || "Não foi possível ativar a ficha devido a pendências."
      );
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-200 pb-12">
      {/* Barra Superior */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para editar</span>
        </Button>
      </div>

      {/* Cabeçalho da Tela (Figma Tela 21) */}
      <div className="border-b border-border pb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          VERSÃO DA FICHA
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
          Revise o que muda
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Comparação antes de ativar uma nova versão oficial da sua ficha.
        </p>
      </div>

      {/* Mensagens de Erro ou Bloqueio */}
      {!validation.canActivate && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Pendências obrigatórias para ativação:</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 text-destructive/90">
            {validation.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-lg border border-destructive bg-destructive/10 text-destructive text-xs">
          {errorMessage}
        </div>
      )}

      {/* Cards de Resumo e Comparação */}
      <div className="space-y-3">
        {/* Nome da Ficha */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <span className="text-xs font-semibold text-muted-foreground">Nome da ficha</span>
          <div className="flex items-center justify-between text-sm font-bold text-foreground">
            <span>{plan.name}</span>
            <Badge variant="outline" className="text-xs font-mono">
              Versão {plan.version}
            </Badge>
          </div>
          {diff?.nameChanged && diff.oldName && (
            <p className="text-xs text-muted-foreground">
              Anterior: <span className="line-through">{diff.oldName}</span>
            </p>
          )}
        </div>

        {/* Exercícios e Metas (Diff Estruturado) */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-2">
          <span className="text-xs font-semibold text-muted-foreground">Divisões e Metas</span>
          <div className="text-xs text-foreground space-y-2">
            <p className="text-muted-foreground">
              {plan.divisions.length} {plan.divisions.length === 1 ? "treino" : "treinos"} configurados:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.divisions.map((d) => (
                <div key={d.id} className="p-2.5 rounded-lg border border-border/60 bg-muted/20 text-xs">
                  <div className="font-bold flex items-center justify-between">
                    <span>{d.letter ? `Treino ${d.letter}` : d.name}</span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      {d.prescribedExercises.length} ex.
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{d.name}</p>
                </div>
              ))}
            </div>

            {/* Mudanças detectadas em relação à versão anterior */}
            {diff && (
              <div className="pt-2 border-t border-border/50 space-y-1.5 text-xs text-muted-foreground">
                {diff.divisionsAdded.length > 0 && (
                  <p className="text-emerald-500 font-medium">
                    + Divisões adicionadas: {diff.divisionsAdded.join(", ")}
                  </p>
                )}
                {diff.divisionsRemoved.length > 0 && (
                  <p className="text-destructive font-medium">
                    - Divisões removidas: {diff.divisionsRemoved.join(", ")}
                  </p>
                )}
                {diff.divisionsModified.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Ajustes por treino:</p>
                    {diff.divisionsModified.map((dm) => (
                      <div key={dm.divisionName} className="pl-2 border-l border-primary/40 space-y-0.5">
                        <span className="font-bold text-foreground">{dm.divisionName}:</span>
                        {dm.exercisesModified.map((em) => (
                          <div key={em.exerciseName} className="text-[11px]">
                            • {em.exerciseName.replace(/_/g, " ")}: {em.changes.join("; ")}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card de Segurança: Seu histórico permanece intacto (Figma Tela 21) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
          <div className="flex items-center gap-2 text-foreground font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Seu histórico permanece intacto</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sessões anteriores guardam a prescrição utilizada no momento do treino.
            Uma sessão que já estiver em andamento mantém a versão em que começou.
          </p>
        </div>

        {/* Campo Opcional: Motivo da Revisão */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-2">
          <Label htmlFor="versionReason" className="text-xs font-semibold">
            Motivo da revisão (opcional)
          </Label>
          <Input
            id="versionReason"
            value={versionReason}
            onChange={(e) => setVersionReason(e.target.value)}
            placeholder="Ex: Ajuste de cargas pós-ciclo, progressão de reps..."
            className="text-xs h-10"
          />
        </div>
      </div>

      {/* Ações Inferiores (Figma Tela 21) */}
      <div className="space-y-2 pt-3">
        <Button
          type="button"
          size="lg"
          disabled={!validation.canActivate || isActivating}
          onClick={handleActivate}
          className="w-full gap-2 font-bold text-sm h-12 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Zap className="w-4 h-4 fill-current" />
          {isActivating ? "Ativando versão..." : "Ativar nova versão"}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          className="w-full font-semibold text-xs h-11"
        >
          Voltar para editar
        </Button>
      </div>
    </div>
  );
}
