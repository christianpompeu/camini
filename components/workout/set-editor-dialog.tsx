"use client";

import React, { useState, useEffect } from "react";
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
import { MeasurementType, SetRecord } from "@/store/useWorkoutStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

interface SetEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setRecord: SetRecord | null;
  measurementType: MeasurementType;
  onSave: (setId: string, updates: Partial<SetRecord>) => void;
  onDelete: (setId: string) => void;
}

export function SetEditorDialog({
  open,
  onOpenChange,
  setRecord,
  measurementType,
  onSave,
  onDelete,
}: SetEditorDialogProps) {
  const [weight, setWeight] = useState(setRecord?.weight !== undefined ? setRecord.weight.toString() : "");
  const [reps, setReps] = useState(setRecord?.reps !== undefined ? setRecord.reps.toString() : "");
  const [duration, setDuration] = useState(setRecord?.durationSeconds !== undefined ? setRecord.durationSeconds.toString() : "");
  const [distance, setDistance] = useState(setRecord?.distanceMeters !== undefined ? setRecord.distanceMeters.toString() : "");
  const [rir, setRir] = useState<string>(setRecord?.rir !== undefined ? setRecord.rir.toString() : "none");
  const [isWarmup, setIsWarmup] = useState(setRecord?.type === "warmup");
  const [side, setSide] = useState<"none" | "left" | "right">(setRecord?.side || "none");
  const [note, setNote] = useState(setRecord?.note || "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!setRecord) return null;

  const handleSave = () => {
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight) || numWeight < 0) return; // bloqueia carga negativa ou NaN

    const updates: Partial<SetRecord> = {
      weight: numWeight,
      type: isWarmup ? "warmup" : (setRecord.type === "extra" ? "extra" : "work"),
      note: note.trim() || undefined,
      side: side !== "none" ? side : undefined,
    };

    if (rir !== "none") {
      updates.rir = rir === "4+" ? 4 : parseInt(rir);
    } else {
      updates.rir = undefined;
    }

    if (measurementType === "reps") {
      const numReps = parseInt(reps);
      if (isNaN(numReps) || numReps <= 0) return;
      updates.reps = numReps;
    } else if (measurementType === "duration") {
      const numDur = parseInt(duration);
      if (isNaN(numDur) || numDur <= 0) return;
      updates.durationSeconds = numDur;
    } else if (measurementType === "distance") {
      const numDist = parseFloat(distance);
      if (isNaN(numDist) || numDist <= 0) return;
      updates.distanceMeters = numDist;
    }

    onSave(setRecord.id, updates);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(setRecord.id);
      onOpenChange(false);
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Editar Série</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
          {/* Carga */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weight" className="text-right">Carga</Label>
            <Input 
              id="weight" 
              type="number" 
              step="0.5" 
              min="0"
              value={weight} 
              onChange={(e) => setWeight(e.target.value)} 
              className="col-span-3 h-11"
            />
          </div>

          {/* Medida específica */}
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
              />
            </div>
          )}

          {measurementType === "distance" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="distance" className="text-right">Metros</Label>
              <Input 
                id="distance" 
                type="number" 
                min="0.1"
                step="0.1"
                value={distance} 
                onChange={(e) => setDistance(e.target.value)} 
                className="col-span-3 h-11"
              />
            </div>
          )}

          {/* RIR */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rir" className="text-right">RIR</Label>
            <Select value={rir} onValueChange={setRir}>
              <SelectTrigger className="col-span-3 h-11">
                <SelectValue placeholder="Selecione o RIR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não medido</SelectItem>
                <SelectItem value="0">0 (Falha)</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4+">4 ou mais</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Side */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="side" className="text-right">Lado</Label>
            <Select value={side} onValueChange={(val: any) => setSide(val)}>
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

          {/* Warmup Switch */}
          {setRecord.type !== "extra" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Aquecimento</Label>
              <div className="col-span-3 flex items-center">
                <Switch 
                  checked={isWarmup} 
                  onCheckedChange={setIsWarmup} 
                />
              </div>
            </div>
          )}

          {/* Observação */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="note" className="text-right pt-3">Anotação</Label>
            <Textarea 
              id="note" 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              className="col-span-3 min-h-[80px]"
              placeholder="Ex: Amplitude máxima, dor leve..."
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4 sm:justify-between">
          <Button 
            variant={confirmDelete ? "destructive" : "ghost"} 
            onClick={handleDelete}
            className="h-11 sm:w-auto w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {confirmDelete ? "Toque para Confirmar" : "Excluir"}
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-11">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1 h-11">
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
