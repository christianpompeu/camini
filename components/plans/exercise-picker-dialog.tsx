"use client";

import React, { useState, useMemo } from "react";
import { useExerciseCatalogStore } from "@/store/useExerciseCatalogStore";
import { CatalogExercise } from "@/types/exercise";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Dumbbell, Check, AlertCircle } from "lucide-react";

interface ExercisePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exercise: CatalogExercise) => void;
  selectedExerciseId?: string;
  title?: string;
}

export function ExercisePickerDialog({
  open,
  onOpenChange,
  onSelectExercise,
  selectedExerciseId,
  title = "Selecionar Exercício do Catálogo",
}: ExercisePickerDialogProps) {
  const { exercises } = useExerciseCatalogStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("all");

  const muscleFilterOptions = [
    { id: "all", label: "Todos os músculos" },
    { id: "Quadríceps", label: "Pernas" },
    { id: "Peitoral", label: "Peitoral" },
    { id: "Costas", label: "Costas" },
    { id: "Ombros", label: "Ombros" },
    { id: "Bíceps", label: "Braços" },
    { id: "Core", label: "Core" },
  ];

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      // Oculta exercícios arquivados por padrão para novas seleções
      if (ex.status === "archived") return false;

      // Filtro de músculo
      if (selectedMuscle !== "all") {
        const matchesPrimary = ex.primaryMuscles.some((m) =>
          m.toLowerCase().includes(selectedMuscle.toLowerCase())
        );
        const matchesSecondary = ex.secondaryMuscles?.some((m) =>
          m.toLowerCase().includes(selectedMuscle.toLowerCase())
        );
        if (!matchesPrimary && !matchesSecondary) return false;
      }

      // Busca textual
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = ex.name.toLowerCase().includes(q);
        const matchAlt = ex.alternativeNames?.some((a) => a.toLowerCase().includes(q));
        const matchMuscles = ex.primaryMuscles.some((m) => m.toLowerCase().includes(q));
        if (!matchName && !matchAlt && !matchMuscles) return false;
      }

      return true;
    });
  }, [exercises, searchQuery, selectedMuscle]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b border-border">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Escolha um exercício cadastrado no catálogo para incluir na prescrição.
          </DialogDescription>

          {/* Campo de Busca */}
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none mt-1" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou grupo muscular..."
              className="pl-9 text-xs h-9"
            />
          </div>

          {/* Chips de Músculo */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 scrollbar-none">
            {muscleFilterOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedMuscle(opt.id)}
                className={`text-[11px] py-1 px-2.5 rounded-full font-medium shrink-0 transition-colors ${
                  selectedMuscle === opt.id
                    ? "bg-foreground text-background font-bold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Lista de Exercícios Disponíveis */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((ex) => {
              const isSelected = ex.id === selectedExerciseId;
              const isPublished = ex.status === "published";

              return (
                <div
                  key={ex.id}
                  onClick={() => {
                    onSelectExercise(ex);
                    onOpenChange(false);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border bg-card hover:border-foreground/20 hover:bg-muted/10"
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-foreground truncate">
                        {ex.name}
                      </h4>
                      {!isPublished && (
                        <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30 gap-1 py-0">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Rascunho
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                      <span>{ex.primaryMuscles.join(", ")}</span>
                      <span>•</span>
                      <span className="capitalize">{ex.equipment.join(", ")}</span>
                      <span>•</span>
                      <span>
                        {ex.measurementType === "reps"
                          ? "Repetições"
                          : ex.measurementType === "duration"
                          ? "Duração"
                          : "Distância"}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs shrink-0"
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Selecionado
                      </>
                    ) : (
                      "Selecionar"
                    )}
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
              <Dumbbell className="w-8 h-8 mx-auto text-muted-foreground/40" />
              <p>Nenhum exercício encontrado para os filtros selecionados.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
