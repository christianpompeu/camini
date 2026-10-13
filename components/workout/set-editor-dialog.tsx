"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { EditSetContext, SetRecord } from "@/store/useWorkoutStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, AlertCircle } from "lucide-react";

interface SetEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: EditSetContext | null;
  onSave: (context: EditSetContext, updates: Partial<SetRecord>) => void;
  onDelete: (context: EditSetContext) => void;
}

export function SetEditorDialog({
  open,
  onOpenChange,
  context,
  onSave,
  onDelete,
}: SetEditorDialogProps) {
  if (!context) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <SetEditorForm
          key={`${context.sessionId}-${context.setRecord.id}`}
          context={context}
          onSave={(ctx, updates) => {
            onSave(ctx, updates);
            onOpenChange(false);
          }}
          onDelete={(ctx) => {
            onDelete(ctx);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function SetEditorForm({
  context,
  onSave,
  onDelete,
  onCancel,
}: {
  context: EditSetContext;
  onSave: (context: EditSetContext, updates: Partial<SetRecord>) => void;
  onDelete: (context: EditSetContext) => void;
  onCancel: () => void;
}) {
  const rec = context.setRecord;
  const [weight, setWeight] = useState(
    rec.weight !== undefined ? rec.weight.toString() : (context.loadConvention === "bodyweight" ? "0" : "")
  );
  const [reps, setReps] = useState(rec.reps !== undefined ? rec.reps.toString() : "");
  const [duration, setDuration] = useState(rec.durationSeconds !== undefined ? rec.durationSeconds.toString() : "");
  const [distance, setDistance] = useState(rec.distanceMeters !== undefined ? rec.distanceMeters.toString() : "");
  const [rir, setRir] = useState<string>(
    rec.rir !== undefined ? (rec.rir >= 4 ? "4+" : rec.rir.toString()) : "none"
  );
  const [isWarmup, setIsWarmup] = useState(rec.type === "warmup");
  const [isExtra, setIsExtra] = useState(Boolean(rec.isExtra || rec.type === "extra"));
  const [side, setSide] = useState<"none" | "left" | "right">(rec.side || "none");
  const [note, setNote] = useState(rec.note || "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { measurementType, loadConvention, exerciseName, mode } = context;

  const handleSave = () => {
    setErrorMessage(null);

    // Validação de carga
    let numWeight = parseFloat(weight);
    if (loadConvention === "bodyweight" && (weight === "" || isNaN(numWeight))) {
      numWeight = 0; // Para peso corporal, carga vazia é assumida como 0 kg adicional
    } else {
      if (isNaN(numWeight) || !Number.isFinite(numWeight) || numWeight < 0) {
        setErrorMessage("A carga deve ser um número válido maior ou igual a zero.");
        return;
      }
    }

    const updates: Partial<SetRecord> = {
      weight: numWeight,
      type: isWarmup ? "warmup" : "work",
      isExtra,
      note: note.trim() || undefined,
      side: side !== "none" ? side : undefined,
    };

    // RIR
    if (rir !== "none") {
      updates.rir = rir === "4+" ? 4 : parseInt(rir, 10);
    } else {
      updates.rir = undefined;
    }

    // Validações por tipo de medida (evitando contaminação entre modalidades)
    if (measurementType === "reps") {
      const numReps = Number(reps);
      if (!reps || !Number.isInteger(numReps) || numReps <= 0) {
        setErrorMessage("Repetições devem ser um número inteiro positivo.");
        return;
      }
      updates.reps = numReps;
      updates.durationSeconds = undefined;
      updates.distanceMeters = undefined;
    } else if (measurementType === "duration") {
      const numDur = parseFloat(duration);
      if (!duration || isNaN(numDur) || !Number.isFinite(numDur) || numDur <= 0) {
        setErrorMessage("A duração em segundos deve ser maior que zero.");
        return;
      }
      updates.durationSeconds = numDur;
      updates.reps = undefined;
      updates.distanceMeters = undefined;
    } else if (measurementType === "distance") {
      const numDist = parseFloat(distance);
      if (!distance || isNaN(numDist) || !Number.isFinite(numDist) || numDist <= 0) {
        setErrorMessage("A distância em metros deve ser maior que zero.");
        return;
      }
      updates.distanceMeters = numDist;
      updates.reps = undefined;
      updates.durationSeconds = undefined;
    }

    onSave(context, updates);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(context);
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <>
      <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <DialogTitle>Editar Série</DialogTitle>
            <Badge variant="outline" className="text-xs">
              {mode === "active" ? "Sessão Ativa" : "Histórico"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{exerciseName}</p>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid gap-4 py-2 max-h-[65vh] overflow-y-auto px-1">
          {/* Carga */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weight" className="text-right">
              {loadConvention === "per_implement"
                ? "Carga (Halter)"
                : loadConvention === "bodyweight"
                ? "Carga Adic."
                : "Carga (kg)"}
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="weight"
                type="number"
                step="0.5"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="h-11"
                placeholder={loadConvention === "bodyweight" ? "0 (Peso corporal)" : "0"}
              />
              {loadConvention === "bodyweight" && (
                <span className="text-[10px] text-muted-foreground block">
                  Exercício com peso corporal. Use 0 se não houver carga externa.
                </span>
              )}
            </div>
          </div>

          {/* Medida específica conforme measurementType */}
          {measurementType === "reps" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reps" className="text-right">Repetições</Label>
              <Input
                id="reps"
                type="number"
                min="1"
                step="1"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="col-span-3 h-11"
                placeholder="Ex: 8"
              />
            </div>
          )}

          {measurementType === "duration" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">Segundos</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                step="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="col-span-3 h-11"
                placeholder="Ex: 60"
              />
            </div>
          )}

          {measurementType === "distance" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="distance" className="text-right">Metros</Label>
              <Input
                id="distance"
                type="number"
                min="0.5"
                step="0.5"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="col-span-3 h-11"
                placeholder="Ex: 30"
              />
            </div>
          )}

          {/* RIR */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rir" className="text-right">RIR</Label>
            <Select value={rir} onValueChange={(val) => val && setRir(val)}>
              <SelectTrigger className="col-span-3 h-11">
                <SelectValue placeholder="Selecione o RIR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não informado</SelectItem>
                <SelectItem value="0">0 (Falha concêntrica)</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4+">4 ou mais</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Side (Unilateral quando aplicável) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="side" className="text-right">Lado</Label>
            <Select
              value={side}
              onValueChange={(val) => {
                if (val === "none" || val === "left" || val === "right") setSide(val);
              }}
            >
              <SelectTrigger className="col-span-3 h-11">
                <SelectValue placeholder="Bilateral/Indefinido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Bilateral/Indefinido</SelectItem>
                <SelectItem value="left">Esquerdo</SelectItem>
                <SelectItem value="right">Direito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Classificações independentes: Aquecimento e Extra */}
          <div className="grid grid-cols-4 items-center gap-4 pt-1">
            <Label className="text-right">Aquecimento</Label>
            <div className="col-span-3 flex items-center justify-between">
              <Switch checked={isWarmup} onCheckedChange={setIsWarmup} />
              <span className="text-xs text-muted-foreground">
                {isWarmup ? "Série de aquecimento" : "Série de trabalho"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Série Extra</Label>
            <div className="col-span-3 flex items-center justify-between">
              <Switch checked={isExtra} onCheckedChange={setIsExtra} />
              <span className="text-xs text-muted-foreground">
                {isExtra ? "Identificada como série extra" : "Série da prescrição"}
              </span>
            </div>
          </div>

          {/* Observação opcional */}
          <div className="grid grid-cols-4 items-start gap-4 pt-1">
            <Label htmlFor="note" className="text-right pt-3">Anotação</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="col-span-3 min-h-[70px] text-xs"
              placeholder="Ex: Amplitude máxima, dor leve, ajuste de carga..."
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-3 sm:justify-between">
          <Button
            variant={confirmDelete ? "destructive" : "ghost"}
            onClick={handleDelete}
            className="h-11 sm:w-auto w-full text-xs"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {confirmDelete ? "Confirmar Exclusão" : "Excluir Série"}
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-11 text-xs"
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1 h-11 text-xs font-semibold">
              Salvar Alterações
            </Button>
          </div>
        </DialogFooter>
    </>
  );
}

