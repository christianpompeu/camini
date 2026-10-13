"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CatalogExercise } from "@/types/exercise";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MediaGalleryModal } from "./media-gallery-modal";
import {
  ArrowLeft,
  Edit3,
  Archive,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  FileText,
  AlertCircle,
  Dumbbell,
  Layers,
  Sparkles,
} from "lucide-react";

interface ExerciseDetailViewProps {
  exercise: CatalogExercise;
  onBack: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export function ExerciseDetailView({
  exercise,
  onBack,
  onEdit,
  onArchive,
  onRestore,
}: ExerciseDetailViewProps) {
  const [activeSegment, setActiveSegment] = useState<"execucao" | "musculos" | "dicas">("execucao");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);

  const primaryMedia = exercise.media.find((m) => m.availability === "available" && m.url) || exercise.media[0];
  const hasAvailableMedia = Boolean(primaryMedia && primaryMedia.availability === "available" && primaryMedia.url);

  const primaryMuscle = exercise.primaryMuscles[0] || "Geral";
  const equipmentLabel =
    exercise.equipment.length > 0
      ? exercise.equipment
          .map((eq) => {
            switch (eq) {
              case "barbell":
                return "Barra";
              case "dumbbell":
                return "Halteres";
              case "kettlebell":
                return "Kettlebell";
              case "cable":
                return "Polia";
              case "machine":
                return "Máquina";
              case "bodyweight":
                return "Peso corporal";
              case "band":
                return "Elástico";
              case "bench":
                return "Banco";
              case "plate":
                return "Anilha";
              default:
                return eq;
            }
          })
          .join(", ")
      : "Sem equipamento especificado";

  const lateralityLabel =
    exercise.laterality === "unilateral"
      ? "Unilateral (por lado)"
      : exercise.laterality === "bilateral"
      ? "Bilateral"
      : exercise.laterality === "alternating"
      ? "Alternado"
      : "Geral";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Barra de Ação Superior / Navegação */}
      <div className="flex items-center justify-between gap-2 border-b border-border pb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à biblioteca
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-xs gap-1.5 h-8"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar
          </Button>

          {exercise.status === "archived" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRestore}
              className="text-xs gap-1.5 h-8 text-emerald-600 dark:text-emerald-400"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restaurar
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmArchiveOpen(true)}
              className="text-xs gap-1.5 h-8 text-muted-foreground hover:text-destructive"
            >
              <Archive className="w-3.5 h-3.5" />
              Arquivar
            </Button>
          )}
        </div>
      </div>

      {/* Cabeçalho do Exercício */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span>EXERCÍCIO</span>
          <span>/</span>
          <span className="text-primary">{primaryMuscle}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {exercise.name}
          </h1>

          <div className="flex items-center gap-2 flex-wrap">
            {exercise.status === "draft" && (
              <Badge variant="secondary" className="text-xs">
                Rascunho
              </Badge>
            )}
            {exercise.status === "archived" && (
              <Badge variant="outline" className="text-xs border-dashed text-muted-foreground">
                Arquivado
              </Badge>
            )}
            {exercise.status === "published" && (
              <Badge variant="default" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Publicado
              </Badge>
            )}
            {exercise.reviewStatus === "pending" && (
              <Badge
                variant="outline"
                className="text-xs border-amber-400 text-amber-600 dark:text-amber-400 gap-1"
              >
                <AlertTriangle className="w-3 h-3" />
                Pendente de conciliação
              </Badge>
            )}
          </div>
        </div>

        {/* Subtítulo / Linha de Foco */}
        <p className="text-xs sm:text-sm text-muted-foreground">
          {equipmentLabel} · {lateralityLabel} · Medida por {exercise.measurementType === "reps" ? "repetições" : exercise.measurementType === "duration" ? "tempo" : "distância"}
        </p>

        {exercise.alternativeNames && exercise.alternativeNames.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 flex-wrap pt-1">
            <span className="font-medium text-foreground">Sinônimos:</span>
            {exercise.alternativeNames.map((alt) => (
              <Badge key={alt} variant="secondary" className="text-[11px] font-normal py-0">
                {alt}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Card Visual / Galeria (Conforme 12-exercicio e 14-midia-indisponivel) */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        {hasAvailableMedia ? (
          <div className="space-y-3 p-4 sm:p-5">
            <div
              onClick={() => setIsGalleryOpen(true)}
              className="relative aspect-video sm:aspect-[16/9] w-full max-h-[380px] bg-muted/30 rounded-xl overflow-hidden border border-border/80 cursor-pointer group flex items-center justify-center"
            >
              <Image
                src={primaryMedia.url!}
                alt={exercise.name}
                fill
                className="object-contain transition-transform duration-200 group-hover:scale-102"
                sizes="(max-width: 640px) 100vw, 700px"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Badge variant="secondary" className="gap-1.5 shadow-md">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Toque para ampliar (Galeria 9:16)
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{primaryMedia.label || "Ficha visual de execução"}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsGalleryOpen(true)}
                className="text-xs h-7 gap-1"
              >
                Ver galeria completa ({exercise.media.length})
              </Button>
            </div>
          </div>
        ) : (
          /* Fallback Gracioso Conforme Tela 14 (Mídia Indisponível Offline) */
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-foreground">
                  A ficha segue com você
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  As imagens e vídeos deste exercício estão pendentes de download local. A indisponibilidade de mídia não apaga nem bloqueia os registros do seu treino.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                <FileText className="w-4 h-4 text-primary" />
                <span>Instruções completas de execução disponíveis abaixo</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                Mídia pendente
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Segmented Control de Seções (Execução | Músculos | Dicas) */}
      <div className="flex p-1 rounded-xl bg-muted/60 border border-border max-w-md">
        <button
          type="button"
          onClick={() => setActiveSegment("execucao")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeSegment === "execucao"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Execução
        </button>
        <button
          type="button"
          onClick={() => setActiveSegment("musculos")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeSegment === "musculos"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Músculos
        </button>
        <button
          type="button"
          onClick={() => setActiveSegment("dicas")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeSegment === "dicas"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Dicas & Cuidados
        </button>
      </div>

      {/* Conteúdo da Aba Selecionada */}
      <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card space-y-4">
        {activeSegment === "execucao" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Passo a Passo de Execução
            </h3>

            {exercise.description && (
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic border-l-2 border-primary/50 pl-3">
                {exercise.description}
              </p>
            )}

            {exercise.instructions && exercise.instructions.length > 0 ? (
              <ol className="space-y-2.5 text-xs sm:text-sm text-foreground/90 list-decimal list-inside leading-relaxed">
                {exercise.instructions.map((step, idx) => (
                  <li key={idx} className="pl-1">
                    <span className="font-medium text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-muted-foreground">
                Nenhuma instrução passo a passo registrada para este exercício.
              </p>
            )}
          </div>
        )}

        {activeSegment === "musculos" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-primary" />
                Músculos Principais (Agonistas)
              </h3>
              <div className="flex gap-2 flex-wrap">
                {exercise.primaryMuscles.map((muscle) => (
                  <Badge key={muscle} variant="default" className="text-xs py-1 px-2.5">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>

            {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Músculos Secundários (Sinergistas)
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {exercise.secondaryMuscles.map((muscle) => (
                    <Badge key={muscle} variant="secondary" className="text-xs py-1 px-2.5">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {exercise.movementPattern && (
              <div className="pt-2 border-t border-border/60">
                <span className="text-xs text-muted-foreground">Padrão Motor: </span>
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  {exercise.movementPattern}
                </span>
              </div>
            )}
          </div>
        )}

        {activeSegment === "dicas" && (
          <div className="space-y-5">
            {exercise.cues && exercise.cues.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Dicas Rápidas (Cues Mentais)
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-foreground/90 list-disc list-inside">
                  {exercise.cues.map((cue, idx) => (
                    <li key={idx} className="font-medium text-emerald-950 dark:text-emerald-200">
                      {cue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {exercise.commonErrors && exercise.commonErrors.length > 0 ? (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-destructive mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Erros Frequentes a Evitar
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-foreground/90 list-disc list-inside">
                  {exercise.commonErrors.map((err, idx) => (
                    <li key={idx} className="font-medium text-destructive/90">
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Nenhum erro frequente catalogado no momento.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal da Galeria 9:16 */}
      {exercise.media.length > 0 && (
        <MediaGalleryModal
          open={isGalleryOpen}
          onOpenChange={setIsGalleryOpen}
          exerciseName={exercise.name}
          media={exercise.media}
        />
      )}

      {/* Diálogo de Confirmação de Arquivamento */}
      <Dialog open={confirmArchiveOpen} onOpenChange={setConfirmArchiveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Arquivar Exercício?</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed pt-2">
              Exercícios arquivados deixam de ser oferecidos para novos treinos, mas continuam acessíveis no histórico e em sessões já realizadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmArchiveOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmArchiveOpen(false);
                onArchive();
              }}
            >
              Confirmar Arquivamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
