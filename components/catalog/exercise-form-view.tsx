"use client";

import React, { useState, useMemo } from "react";
import {
  CatalogExercise,
  Equipment,
  Laterality,
  MovementPattern,
  MeasurementType,
  LoadConvention,
  validateExerciseForPublication,
} from "@/types/exercise";
import { useExerciseCatalogStore } from "@/store/useExerciseCatalogStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";

interface ExerciseFormViewProps {
  initialExercise?: CatalogExercise | null;
  onSaveSuccess: (savedExercise: CatalogExercise) => void;
  onCancel: () => void;
}

const AVAILABLE_EQUIPMENT: { id: Equipment; label: string }[] = [
  { id: "bodyweight", label: "Peso Corporal / Sem Equipamento" },
  { id: "dumbbell", label: "Halteres" },
  { id: "barbell", label: "Barra Olímpica / Reta" },
  { id: "kettlebell", label: "Kettlebell" },
  { id: "cable", label: "Polia / Cabo" },
  { id: "machine", label: "Máquina" },
  { id: "bench", label: "Banco" },
  { id: "plate", label: "Anilha" },
  { id: "band", label: "Elástico" },
  { id: "other", label: "Outro" },
];

const AVAILABLE_MUSCLES = [
  "Quadríceps",
  "Posteriores de Coxa",
  "Glúteos",
  "Panturrilhas",
  "Peitoral",
  "Costas",
  "Dorsais",
  "Deltoides",
  "Deltoide Anterior",
  "Deltoide Lateral",
  "Deltoide Posterior",
  "Trapézio",
  "Bíceps",
  "Tríceps",
  "Antebraço",
  "Core",
  "Abdômen",
  "Lombar",
];

export function ExerciseFormView({
  initialExercise,
  onSaveSuccess,
  onCancel,
}: ExerciseFormViewProps) {
  const { createExercise, updateExercise, checkDuplicateName } = useExerciseCatalogStore();

  const isEditing = Boolean(initialExercise);

  // Estados dos Campos
  const [name, setName] = useState(initialExercise?.name || "");
  const [alternativeNames, setAlternativeNames] = useState(
    initialExercise?.alternativeNames?.join(", ") || ""
  );
  const [description, setDescription] = useState(initialExercise?.description || "");
  const [movementPattern, setMovementPattern] = useState<MovementPattern>(
    initialExercise?.movementPattern || "squat"
  );
  const [laterality, setLaterality] = useState<Laterality>(
    initialExercise?.laterality || "bilateral"
  );
  const [measurementType, setMeasurementType] = useState<MeasurementType>(
    initialExercise?.measurementType || "reps"
  );
  const [loadConvention, setLoadConvention] = useState<LoadConvention>(
    initialExercise?.loadConvention || "total"
  );
  const [equipment, setEquipment] = useState<Equipment[]>(
    initialExercise?.equipment || ["bodyweight"]
  );
  const [primaryMuscles, setPrimaryMuscles] = useState<string[]>(
    initialExercise?.primaryMuscles || ["Peitoral"]
  );
  const [secondaryMuscles, setSecondaryMuscles] = useState<string[]>(
    initialExercise?.secondaryMuscles || []
  );

  const [instructions, setInstructions] = useState<string[]>(
    initialExercise?.instructions && initialExercise.instructions.length > 0
      ? initialExercise.instructions
      : [""]
  );
  const [commonErrors, setCommonErrors] = useState<string[]>(
    initialExercise?.commonErrors && initialExercise.commonErrors.length > 0
      ? initialExercise.commonErrors
      : [""]
  );
  const [cues, setCues] = useState<string[]>(
    initialExercise?.cues && initialExercise.cues.length > 0 ? initialExercise.cues : [""]
  );

  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Monitora possíveis nomes duplicados em tempo real
  const duplicateExercises = useMemo(() => {
    if (!name || name.trim().length < 3) return [];
    return checkDuplicateName(name, initialExercise?.id);
  }, [name, initialExercise?.id, checkDuplicateName]);

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  const toggleEquipment = (eq: Equipment) => {
    markDirty();
    setEquipment((prev) =>
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    );
  };

  const togglePrimaryMuscle = (muscle: string) => {
    markDirty();
    setPrimaryMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  const toggleSecondaryMuscle = (muscle: string) => {
    markDirty();
    setSecondaryMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  // Manipulação de listas de texto
  const handleInstructionChange = (index: number, val: string) => {
    markDirty();
    const updated = [...instructions];
    updated[index] = val;
    setInstructions(updated);
  };

  const addInstruction = () => {
    markDirty();
    setInstructions([...instructions, ""]);
  };

  const removeInstruction = (index: number) => {
    markDirty();
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleErrorChange = (index: number, val: string) => {
    markDirty();
    const updated = [...commonErrors];
    updated[index] = val;
    setCommonErrors(updated);
  };

  const addError = () => {
    markDirty();
    setCommonErrors([...commonErrors, ""]);
  };

  const removeError = (index: number) => {
    markDirty();
    setCommonErrors(commonErrors.filter((_, i) => i !== index));
  };

  const handleCueChange = (index: number, val: string) => {
    markDirty();
    const updated = [...cues];
    updated[index] = val;
    setCues(updated);
  };

  const addCue = () => {
    markDirty();
    setCues([...cues, ""]);
  };

  const removeCue = (index: number) => {
    markDirty();
    setCues(cues.filter((_, i) => i !== index));
  };

  // Coleta os dados preparados para persistência
  const collectFormData = (targetStatus: "draft" | "published"): Partial<CatalogExercise> => {
    const cleanedAlts = alternativeNames
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const cleanedInstructions = instructions.map((i) => i.trim()).filter(Boolean);
    const cleanedErrors = commonErrors.map((e) => e.trim()).filter(Boolean);
    const cleanedCues = cues.map((c) => c.trim()).filter(Boolean);

    return {
      name: name.trim(),
      alternativeNames: cleanedAlts,
      description: description.trim() || undefined,
      movementPattern,
      laterality,
      measurementType,
      loadConvention,
      equipment,
      primaryMuscles,
      secondaryMuscles,
      instructions: cleanedInstructions,
      commonErrors: cleanedErrors,
      cues: cleanedCues,
      status: targetStatus,
      reviewStatus: "reviewed",
      media: initialExercise?.media || [],
    };
  };

  // Salvar como Rascunho (sem validações estritas de publicação)
  const handleSaveDraft = () => {
    setErrorBanner(null);
    setValidationErrors([]);

    if (!name || name.trim().length === 0) {
      setErrorBanner("Informe ao menos o nome do exercício para salvar como rascunho.");
      return;
    }

    try {
      const data = collectFormData("draft");
      let saved: CatalogExercise;

      if (isEditing && initialExercise) {
        updateExercise(initialExercise.id, data);
        saved = { ...initialExercise, ...data } as CatalogExercise;
      } else {
        saved = createExercise(data as Omit<CatalogExercise, "id" | "version" | "createdAt" | "updatedAt">);
      }

      onSaveSuccess(saved);
    } catch {
      setErrorBanner("Erro ao gravar dados no armazenamento local. Tente novamente.");
    }
  };

  // Publicar Exercício (com validação completa)
  const handlePublish = () => {
    setErrorBanner(null);
    setValidationErrors([]);

    const data = collectFormData("published");
    const validation = validateExerciseForPublication(data);

    if (!validation.canPublish) {
      setValidationErrors(validation.errors);
      setErrorBanner("Corrija as pendências abaixo antes de publicar o exercício:");
      return;
    }

    try {
      let saved: CatalogExercise;
      if (isEditing && initialExercise) {
        updateExercise(initialExercise.id, {
          ...data,
          status: "published",
        });
        saved = { ...initialExercise, ...data, status: "published" } as CatalogExercise;
      } else {
        saved = createExercise({
          ...data,
          status: "published",
        } as Omit<CatalogExercise, "id" | "version" | "createdAt" | "updatedAt">);
      }

      onSaveSuccess(saved);
    } catch {
      setErrorBanner("Erro ao gravar dados no armazenamento local. Tente novamente.");
    }
  };

  const handleAttemptCancel = () => {
    if (isDirty) {
      setConfirmDiscardOpen(true);
    } else {
      onCancel();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Barra de Ação Superior */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAttemptCancel}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancelar
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            className="text-xs gap-1.5 h-9"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar Rascunho
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handlePublish}
            className="text-xs gap-1.5 h-9 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Publicar Exercício
          </Button>
        </div>
      </div>

      {/* Título do Formulário */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {isEditing ? "Editar Exercício" : "Novo Exercício do Catálogo"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Defina as características biomecânicas, equipamentos e orientações técnicas do movimento.
        </p>
      </div>

      {/* Alertas de Erro e Validação */}
      {errorBanner && (
        <div className="p-4 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          {validationErrors.length > 0 && (
            <ul className="list-disc list-inside space-y-1 pl-2 font-medium">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Aviso de Nome Duplicado (sem bloquear variantes legítimas) */}
      {duplicateExercises.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Aviso: possível nome duplicado</p>
            <p className="text-[11px] leading-relaxed">
              Já existe(m) exercício(s) com nome ou sinônimo similar no catálogo:{" "}
              <span className="font-semibold">{duplicateExercises.map((d) => d.name).join(", ")}</span>. Se este for uma variante com outro implemento ou execução, você pode prosseguir normalmente.
            </p>
          </div>
        </div>
      )}

      {/* Seção 1: Identificação Básica */}
      <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          1. Identificação do Movimento
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="ex-name" className="text-xs font-semibold">
            Nome do Exercício *
          </Label>
          <Input
            id="ex-name"
            value={name}
            onChange={(e) => {
              markDirty();
              setName(e.target.value);
            }}
            placeholder="Ex: Supino Reto com Barra"
            className="text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ex-alts" className="text-xs font-semibold">
            Nomes Alternativos / Sinônimos
          </Label>
          <Input
            id="ex-alts"
            value={alternativeNames}
            onChange={(e) => {
              markDirty();
              setAlternativeNames(e.target.value);
            }}
            placeholder="Separados por vírgula (ex: Bench Press, Supino Barra)"
            className="text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ex-desc" className="text-xs font-semibold">
            Descrição Geral do Movimento
          </Label>
          <Textarea
            id="ex-desc"
            value={description}
            onChange={(e) => {
              markDirty();
              setDescription(e.target.value);
            }}
            placeholder="Breve descrição biomecânica, objetivo ou contexto do exercício..."
            className="text-xs min-h-[80px]"
          />
        </div>
      </div>

      {/* Seção 2: Classificação Motora e Prescrição de Carga */}
      <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          2. Classificação Biomecânica e Modalidade
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Padrão de Movimento</Label>
            <Select
              value={movementPattern}
              onValueChange={(val) => {
                if (val) {
                  markDirty();
                  setMovementPattern(val as MovementPattern);
                }
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Selecione o padrão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="squat">Agachamento (Joelho dominante)</SelectItem>
                <SelectItem value="hinge">Dobradiça (Quadril dominante / Terra)</SelectItem>
                <SelectItem value="horizontal_push">Empurrar Horizontal (Supino)</SelectItem>
                <SelectItem value="vertical_push">Empurrar Vertical (Desenvolvimento)</SelectItem>
                <SelectItem value="horizontal_pull">Puxar Horizontal (Remadas)</SelectItem>
                <SelectItem value="vertical_pull">Puxar Vertical (Puxadas)</SelectItem>
                <SelectItem value="lunge">Afundo / Avanço (Unilateral)</SelectItem>
                <SelectItem value="carry">Transporte (Farmer&apos;s Walk)</SelectItem>
                <SelectItem value="isolation">Isolamento Monoarticular</SelectItem>
                <SelectItem value="core">Core / Estabilidade</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Lateralidade</Label>
            <Select
              value={laterality}
              onValueChange={(val) => {
                if (val) {
                  markDirty();
                  setLaterality(val as Laterality);
                }
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Selecione a lateralidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bilateral">Bilateral (ambos os lados simultâneos)</SelectItem>
                <SelectItem value="unilateral">Unilateral (um lado de cada vez)</SelectItem>
                <SelectItem value="alternating">Alternado (braço/perna alternando)</SelectItem>
                <SelectItem value="not_applicable">Não aplicável</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tipo de Medida do Exercício</Label>
            <Select
              value={measurementType}
              onValueChange={(val) => {
                if (val) {
                  markDirty();
                  setMeasurementType(val as MeasurementType);
                }
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Selecione a medida" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reps">Repetições (padrão de musculação)</SelectItem>
                <SelectItem value="duration">Duração em Segundos (isometria / prancha)</SelectItem>
                <SelectItem value="distance">Distância em Metros (transporte / caminhada)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Convenção de Carga</Label>
            <Select
              value={loadConvention}
              onValueChange={(val) => {
                if (val) {
                  markDirty();
                  setLoadConvention(val as LoadConvention);
                }
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Selecione a convenção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Carga Total (barra + anilhas somadas)</SelectItem>
                <SelectItem value="per_implement">Por Implemento (peso de cada halter)</SelectItem>
                <SelectItem value="additional">Carga Adicional (peso extra ao corpo)</SelectItem>
                <SelectItem value="bodyweight">Peso Corporal Puro (sem carga externa)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Equipamentos */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <Label className="text-xs font-semibold">
            Equipamentos Necessários (selecione um ou mais) *
          </Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_EQUIPMENT.map((eq) => {
              const selected = equipment.includes(eq.id);
              return (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => toggleEquipment(eq.id)}
                  className={`text-xs py-1.5 px-3 rounded-lg border font-medium transition-all ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {eq.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Seção 3: Grupos Musculares */}
      <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          3. Grupos Musculares Alvo
        </h2>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">
            Músculos Principais (Agonistas) *
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_MUSCLES.map((muscle) => {
              const selected = primaryMuscles.includes(muscle);
              return (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => togglePrimaryMuscle(muscle)}
                  className={`text-xs py-1 px-2.5 rounded-md border transition-all ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary font-bold"
                      : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {muscle}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/60">
          <Label className="text-xs font-semibold">
            Músculos Secundários (Sinergistas)
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_MUSCLES.map((muscle) => {
              const selected = secondaryMuscles.includes(muscle);
              return (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => toggleSecondaryMuscle(muscle)}
                  className={`text-xs py-1 px-2.5 rounded-md border transition-all ${
                    selected
                      ? "bg-secondary text-secondary-foreground border-secondary font-bold"
                      : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {muscle}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Seção 4: Instruções de Execução e Dicas */}
      <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          4. Instruções e Orientações Técnicas
        </h2>

        {/* Passos de Execução */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Passos de Execução *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addInstruction}
              className="text-xs h-7 gap-1"
            >
              <Plus className="w-3 h-3" />
              Adicionar Passo
            </Button>
          </div>
          {instructions.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground w-5 text-right">
                {idx + 1}.
              </span>
              <Input
                value={step}
                onChange={(e) => handleInstructionChange(idx, e.target.value)}
                placeholder={`Passo ${idx + 1} de execução...`}
                className="text-xs flex-1"
              />
              {instructions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInstruction(idx)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Cues Rápidos */}
        <div className="space-y-3 pt-3 border-t border-border/60">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Dicas Rápidas / Cues Mentais
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCue}
              className="text-xs h-7 gap-1"
            >
              <Plus className="w-3 h-3" />
              Adicionar Dica
            </Button>
          </div>
          {cues.map((cue, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={cue}
                onChange={(e) => handleCueChange(idx, e.target.value)}
                placeholder="Ex: Cotovelos colados, peito alto..."
                className="text-xs flex-1"
              />
              {cues.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCue(idx)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Erros Frequentes */}
        <div className="space-y-3 pt-3 border-t border-border/60">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-destructive">
              Erros Frequentes a Evitar
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addError}
              className="text-xs h-7 gap-1"
            >
              <Plus className="w-3 h-3" />
              Adicionar Erro
            </Button>
          </div>
          {commonErrors.map((err, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={err}
                onChange={(e) => handleErrorChange(idx, e.target.value)}
                placeholder="Ex: Arredondar a lombar ao descer..."
                className="text-xs flex-1"
              />
              {commonErrors.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeError(idx)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Botões do Rodapé */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="ghost"
          onClick={handleAttemptCancel}
          className="text-xs w-full sm:w-auto text-muted-foreground"
        >
          Descartar Alterações
        </Button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            className="flex-1 sm:flex-initial text-xs h-10 gap-1.5"
          >
            <Save className="w-4 h-4" />
            Salvar Rascunho
          </Button>
          <Button
            type="button"
            onClick={handlePublish}
            className="flex-1 sm:flex-initial text-xs h-10 gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <CheckCircle2 className="w-4 h-4" />
            Publicar Exercício
          </Button>
        </div>
      </div>

      {/* Diálogo de Confirmação para Descarte com Alterações não Salvas */}
      <Dialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Descartar Alterações não Salvas?</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed pt-2">
              Você realizou alterações no formulário deste exercício. Se você sair agora, as alterações não salvas serão perdidas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmDiscardOpen(false)}
            >
              Continuar Editando
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmDiscardOpen(false);
                onCancel();
              }}
            >
              Sim, Descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
