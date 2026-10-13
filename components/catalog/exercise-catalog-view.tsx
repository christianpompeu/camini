"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useExerciseCatalogStore } from "@/store/useExerciseCatalogStore";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { CatalogExercise, Equipment } from "@/types/exercise";
import { ExerciseCard } from "./exercise-card";
import { ExerciseDetailView } from "./exercise-detail-view";
import { ExerciseFormView } from "./exercise-form-view";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  Dumbbell,
  BookOpen,
  X,
  Play,
  RotateCcw,
} from "lucide-react";

interface ExerciseCatalogViewProps {
  onGoToSession?: () => void;
  initialExerciseId?: string | null;
}

const EQUIPMENT_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "dumbbell", label: "Halteres" },
  { id: "barbell", label: "Barra" },
  { id: "bodyweight", label: "Sem carga" },
  { id: "cable", label: "Polia" },
  { id: "machine", label: "Máquina" },
];

const MUSCLE_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "Todos os músculos" },
  { id: "Costas", label: "Costas" },
  { id: "Peitoral", label: "Peitoral" },
  { id: "Quadríceps", label: "Pernas" },
  { id: "Ombros", label: "Ombros" },
  { id: "Bíceps", label: "Braços" },
  { id: "Core", label: "Core" },
];

const STATUS_FILTERS: { id: "all" | "published" | "draft" | "archived"; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "published", label: "Publicados" },
  { id: "draft", label: "Rascunhos" },
  { id: "archived", label: "Arquivados" },
];

export function ExerciseCatalogView({
  onGoToSession,
  initialExerciseId,
}: ExerciseCatalogViewProps) {
  const {
    exercises,
    initializeCatalog,
    archiveExercise,
    restoreExercise,
    hasHydrated,
  } = useExerciseCatalogStore();

  const { activeWorkout } = useWorkoutStore();

  // Estados de Visualização: "list" | "detail" | "form"
  const [viewMode, setViewMode] = useState<"list" | "detail" | "form">(
    initialExerciseId ? "detail" : "list"
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    initialExerciseId || null
  );
  const [prevInitialId, setPrevInitialId] = useState(initialExerciseId);

  // Ajuste do estado de visualização sincronizado com prop sem acionar effect setState cascata
  if (initialExerciseId && initialExerciseId !== prevInitialId) {
    setPrevInitialId(initialExerciseId);
    setSelectedExerciseId(initialExerciseId);
    setViewMode("detail");
  }

  // Estados de Filtros e Busca
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [selectedMuscle, setSelectedMuscle] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "published" | "draft" | "archived">("all");

  useEffect(() => {
    initializeCatalog();
  }, [initializeCatalog]);

  // Lista Filtrada de Exercícios
  const filteredList = useMemo(() => {
    return exercises.filter((ex) => {
      // Filtro por estado
      if (selectedStatus !== "all" && ex.status !== selectedStatus) {
        return false;
      }
      // Filtro por equipamento
      if (selectedEquipment !== "all" && !ex.equipment.includes(selectedEquipment as Equipment)) {
        return false;
      }
      // Filtro por grupo muscular
      if (selectedMuscle !== "all") {
        const hasPrimary = ex.primaryMuscles.some((m) =>
          m.toLowerCase().includes(selectedMuscle.toLowerCase())
        );
        const hasSecondary = ex.secondaryMuscles?.some((m) =>
          m.toLowerCase().includes(selectedMuscle.toLowerCase())
        );
        if (!hasPrimary && !hasSecondary) return false;
      }
      // Busca textual (nome, sinônimos, descrição, músculos)
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = ex.name.toLowerCase().includes(q);
        const matchAlt = ex.alternativeNames?.some((a) => a.toLowerCase().includes(q));
        const matchDesc = ex.description?.toLowerCase().includes(q);
        const matchMuscles = ex.primaryMuscles.some((m) => m.toLowerCase().includes(q));
        if (!matchName && !matchAlt && !matchDesc && !matchMuscles) return false;
      }
      return true;
    });
  }, [exercises, searchQuery, selectedEquipment, selectedMuscle, selectedStatus]);

  const selectedExercise = useMemo(() => {
    if (!selectedExerciseId) return null;
    return exercises.find((e) => e.id === selectedExerciseId) || null;
  }, [selectedExerciseId, exercises]);

  const handleOpenDetail = (exercise: CatalogExercise) => {
    setSelectedExerciseId(exercise.id);
    setViewMode("detail");
  };

  const handleStartCreate = () => {
    setSelectedExerciseId(null);
    setViewMode("form");
  };

  const handleStartEdit = () => {
    setViewMode("form");
  };

  const handleFormSaveSuccess = (saved: CatalogExercise) => {
    setSelectedExerciseId(saved.id);
    setViewMode("detail");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedEquipment("all");
    setSelectedMuscle("all");
    setSelectedStatus("all");
  };

  // 1. RENDERIZA FORMULÁRIO DE CADASTRO / EDIÇÃO
  if (viewMode === "form") {
    return (
      <ExerciseFormView
        initialExercise={selectedExercise}
        onSaveSuccess={handleFormSaveSuccess}
        onCancel={() => {
          if (selectedExerciseId) {
            setViewMode("detail");
          } else {
            setViewMode("list");
          }
        }}
      />
    );
  }

  // 2. RENDERIZA DETALHE DO EXERCÍCIO
  if (viewMode === "detail" && selectedExercise) {
    return (
      <ExerciseDetailView
        exercise={selectedExercise}
        onBack={() => {
          setSelectedExerciseId(null);
          setViewMode("list");
        }}
        onEdit={handleStartEdit}
        onArchive={() => archiveExercise(selectedExercise.id)}
        onRestore={() => restoreExercise(selectedExercise.id)}
      />
    );
  }

  // 3. RENDERIZA LISTAGEM DA BIBLIOTECA (TELA 11 - FIGMA)
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Cabeçalho da Biblioteca */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">
              BIBLIOTECA DE EXERCÍCIOS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Entenda o movimento
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Busca por nome, músculo ou equipamento.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleStartCreate}
          className="text-xs font-semibold gap-1.5 h-10 self-start sm:self-auto bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Novo Exercício
        </Button>
      </div>

      {/* Banner de Sessão Ativa (Inspirado no Figma 11-biblioteca) */}
      {activeWorkout && onGoToSession && (
        <div className="p-4 sm:p-5 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Consulte durante o descanso
            </h4>
            <p className="text-xs text-muted-foreground">
              Ao voltar para a sessão ativa (Treino {activeWorkout.letter}), seus registros permanecem intactos.
            </p>
          </div>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onGoToSession}
            className="text-xs font-semibold gap-1.5 h-9 shrink-0 w-full sm:w-auto"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Retomar sessão
          </Button>
        </div>
      )}

      {/* Campo de Busca Principal (Figma 11: Buscar com campo arredondado) */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nome, sinônimo ou grupo muscular..."
          className="pl-10 pr-9 h-12 text-sm rounded-xl bg-card border-border shadow-xs focus-visible:ring-2 focus-visible:ring-primary"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtros em Chips Deslizantes (Equipamento) */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {EQUIPMENT_FILTERS.map((eq) => {
            const isSelected = selectedEquipment === eq.id;
            return (
              <button
                key={eq.id}
                type="button"
                onClick={() => setSelectedEquipment(eq.id)}
                className={`text-xs py-1.5 px-3.5 rounded-full font-semibold transition-all shrink-0 ${
                  isSelected
                    ? "bg-foreground text-background shadow-xs"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {eq.label}
              </button>
            );
          })}
        </div>

        {/* Linha Secundária de Filtros: Músculo e Estado */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 shrink-0">
            {MUSCLE_FILTERS.map((m) => {
              const isSelected = selectedMuscle === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMuscle(m.id)}
                  className={`py-1 px-2.5 rounded-md text-[11px] font-medium transition-all ${
                    isSelected
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-auto">
            {STATUS_FILTERS.map((st) => {
              const isSelected = selectedStatus === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStatus(st.id)}
                  className={`py-1 px-2 rounded-md text-[11px] transition-all ${
                    isSelected
                      ? "bg-muted text-foreground font-bold"
                      : "text-muted-foreground/80 hover:text-foreground"
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contagem e Status da Listagem */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {filteredList.length} {filteredList.length === 1 ? "exercício encontrado" : "exercícios encontrados"}
        </span>

        {(searchQuery || selectedEquipment !== "all" || selectedMuscle !== "all" || selectedStatus !== "all") && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-primary hover:underline font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Limpar filtros
          </button>
        )}
      </div>

      {/* Lista de Cards de Exercício */}
      {filteredList.length > 0 ? (
        <div className="space-y-3">
          {filteredList.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={() => handleOpenDetail(exercise)}
            />
          ))}
        </div>
      ) : (
        /* Estados de Vazio e Nenhum Resultado */
        <div className="p-12 text-center border border-border rounded-2xl bg-card flex flex-col items-center justify-center space-y-3">
          <Dumbbell className="w-10 h-10 text-muted-foreground/50 stroke-[1.5]" />
          <h3 className="font-bold text-base text-foreground">
            {exercises.length === 0 && hasHydrated
              ? "Catálogo vazio"
              : "Nenhum exercício encontrado"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {exercises.length === 0
              ? "Nenhum exercício cadastrado no momento. Você pode inicializar os exercícios canônicos ou criar um novo."
              : "Nenhum resultado correspondeu aos termos de busca e filtros selecionados."}
          </p>
          <div className="pt-2 flex gap-2">
            {exercises.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar filtros
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={initializeCatalog}
                className="text-xs gap-1.5"
              >
                Carregar Exercícios Padrão
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleStartCreate}
              className="text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Criar Novo Exercício
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
