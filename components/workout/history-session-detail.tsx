"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WorkoutSession, SetRecord, MeasurementType } from "@/store/useWorkoutStore";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Calendar, Clock, Activity, Check, CheckCircle2, MoreVertical, Search, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HistorySessionDetailProps {
  session: WorkoutSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditSet: (set: SetRecord, measurementType: MeasurementType, sessionId: string) => void;
  onUpdateObservation: (sessionId: string, observation: string) => void;
}

export function HistorySessionDetail({
  session,
  open,
  onOpenChange,
  onEditSet,
  onUpdateObservation
}: HistorySessionDetailProps) {
  const [editingObservation, setEditingObservation] = useState(false);
  const [obsText, setObsText] = useState(session?.observation || "");

  if (!session) return null;

  const totalVolume = session.exercises.reduce((acc, e) => {
    if (e.loadConvention === "bodyweight") return acc;
    return acc + e.sets.reduce((sum, s) => {
      const w = s.weight || 0;
      const r = s.reps || 1;
      return sum + (w * r);
    }, 0);
  }, 0);

  const formatSessionDuration = () => {
    if (!session.durationMs) return "N/A";
    const dur = intervalToDuration({ start: 0, end: session.durationMs });
    if (dur.hours && dur.hours > 0) return `${dur.hours}h ${dur.minutes}m`;
    return `${dur.minutes}m ${dur.seconds}s`;
  };

  const handleSaveObs = () => {
    onUpdateObservation(session.id, obsText);
    setEditingObservation(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
        <DialogHeader className="p-5 pb-4 border-b border-border bg-muted/20">
          <DialogTitle className="flex flex-col gap-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">Treino {session.letter}</span>
              <Badge variant={session.status === "partial" ? "outline" : "default"}>
                {session.status === "partial" ? "Incompleto" : "Completo"}
              </Badge>
            </div>
            <span className="text-sm font-medium text-muted-foreground">{session.title}</span>
          </DialogTitle>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(session.startTime), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{formatSessionDuration()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4" />
              <span>{totalVolume > 0 ? `${totalVolume} kg vol.` : "Peso Corporal"}</span>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto p-5">
          <div className="space-y-6">
            
            {/* Observation Card */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Observações da Sessão</h4>
                {!editingObservation && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setEditingObservation(true)}>
                    {session.observation ? "Editar" : "Adicionar"}
                  </Button>
                )}
              </div>
              
              {editingObservation ? (
                <div className="space-y-2">
                  <Textarea 
                    value={obsText}
                    onChange={(e) => setObsText(e.target.value)}
                    placeholder="Como você se sentiu? Alguma dor?"
                    className="text-sm min-h-[80px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setObsText(session.observation || "");
                      setEditingObservation(false);
                    }}>Cancelar</Button>
                    <Button size="sm" onClick={handleSaveObs}>Salvar</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground">
                  {session.observation || <span className="text-muted-foreground italic">Nenhuma observação registrada.</span>}
                </p>
              )}
            </div>

            {/* Exercises List */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Desempenho</h4>
              
              {session.exercises.filter(ex => ex.sets.length > 0).map((ex, exIdx) => (
                <div key={exIdx} className="border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted/30 px-4 py-3 border-b border-border">
                    <h5 className="font-semibold text-sm">{ex.exerciseName}</h5>
                    <p className="text-xs text-muted-foreground">{ex.targetMuscles}</p>
                  </div>
                  <div className="p-0">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 text-muted-foreground text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-2 font-medium">Série</th>
                          <th className="px-4 py-2 font-medium">Carga</th>
                          <th className="px-4 py-2 font-medium">Medida</th>
                          <th className="px-4 py-2 font-medium">RIR</th>
                          <th className="px-4 py-2 font-medium w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {ex.sets.map((set, setIdx) => (
                          <tr key={set.id} className="hover:bg-muted/10">
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <span>{setIdx + 1}</span>
                                {set.type === "warmup" && <span className="text-[9px] px-1 rounded-sm bg-amber-500/10 text-amber-600">A</span>}
                                {set.type === "extra" && <span className="text-[9px] px-1 rounded-sm bg-primary/10 text-primary">E</span>}
                                {set.editedAt && <span className="text-[9px] px-1 rounded-sm bg-blue-500/10 text-blue-500" title="Corrigida">C</span>}
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              {ex.loadConvention === "bodyweight" ? "-" : `${set.weight}kg`}
                            </td>
                            <td className="px-4 py-2.5 font-medium">
                              {ex.measurementType === "duration" ? `${set.durationSeconds || set.reps}s` :
                               ex.measurementType === "distance" ? `${set.distanceMeters || set.reps}m` :
                               `${set.reps}`}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {set.rir !== undefined ? set.rir : "-"}
                            </td>
                            <td className="px-2 py-2.5 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2 text-xs"
                                onClick={() => onEditSet(set, ex.measurementType, session.id)}
                              >
                                Editar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border bg-card">
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Fechar Resumo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
