"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Pencil,
  Trash2, 
  Loader2, 
  Search, 
  CalendarDays, 
  Clock, 
  X, 
  AlertCircle,
  Sparkles,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  createAula, 
  updateAula, 
  deleteAula, 
  type Aula, 
  type Disciplina, 
  type Professor,
  type TipoOcorrenciaAula,
  type ModalidadeAula 
} from "../actions";

function formatForDateTimeLocal(isoString: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      return isoString.slice(0, 16);
    }
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return isoString.slice(0, 16);
  }
}

// =========================================================================
// Dialog de Edição de Aula / Ocorrência
// =========================================================================
export function EditarAulaDialog({
  aula,
  disciplinas,
  professores,
  onUpdated,
}: {
  aula: Aula;
  disciplinas: Disciplina[];
  professores: Professor[];
  onUpdated?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Determinar o tipo de ocorrência inicial a partir do registro existente
  const initialTipo: TipoOcorrenciaAula = (
    aula.tipo_ocorrencia ||
    (aula.situacao === "Sem aula" ? "Sem aula" : 
     aula.situacao === "Feriado" ? "Feriado" : 
     aula.situacao === "A confirmar" ? "A confirmar" : "Aula")
  ) as TipoOcorrenciaAula;

  const [tipoOcorrencia, setTipoOcorrencia] = useState<TipoOcorrenciaAula>(initialTipo);
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>(aula.disciplina_id || "");
  const [selectedProfessor, setSelectedProfessor] = useState<string>(aula.professor_id || "");
  const [motivo, setMotivo] = useState<string>(aula.motivo || "");
  const [modalidade, setModalidade] = useState<ModalidadeAula>(
    (aula.modalidade as ModalidadeAula) || "Presencial"
  );

  // Resetar campos quando abrir o diálogo
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setError(null);
      const currTipo: TipoOcorrenciaAula = (
        aula.tipo_ocorrencia ||
        (aula.situacao === "Sem aula" ? "Sem aula" : 
         aula.situacao === "Feriado" ? "Feriado" : 
         aula.situacao === "A confirmar" ? "A confirmar" : "Aula")
      ) as TipoOcorrenciaAula;
      setTipoOcorrencia(currTipo);
      setSelectedDisciplina(aula.disciplina_id || "");
      setSelectedProfessor(aula.professor_id || "");
      setMotivo(aula.motivo || "");
      setModalidade((aula.modalidade as ModalidadeAula) || "Presencial");
    }
  };

  const handleTipoChange = (newTipo: TipoOcorrenciaAula) => {
    setTipoOcorrencia(newTipo);
    if (newTipo === "Sem aula") {
      setSelectedDisciplina("");
      if (!motivo) setMotivo("Sem aula");
    } else if (newTipo === "Feriado") {
      setSelectedDisciplina("");
      if (!motivo) setMotivo("Feriado");
    } else if (newTipo === "A confirmar") {
      if (!motivo) setMotivo("A confirmar");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    // Garantir que campos controlados estejam presentes no formData
    formData.set("tipo_ocorrencia", tipoOcorrencia);
    if (tipoOcorrencia === "Sem aula" || tipoOcorrencia === "Feriado") {
      formData.set("disciplina_id", "");
      // Preservar o professor_id existente para satisfazer a restrição NOT NULL do banco
      formData.set("professor_id", selectedProfessor || aula.professor_id);
    } else {
      formData.set("disciplina_id", selectedDisciplina);
      formData.set("professor_id", selectedProfessor || aula.professor_id);
    }
    formData.set("modalidade", modalidade);
    formData.set("motivo", motivo);

    startTransition(async () => {
      const res = await updateAula(aula.id, formData);
      if (res.error) {
        setError(res.error);
      } else {
        setOpen(false);
        router.refresh();
        onUpdated?.();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Editar programação"
          />
        }
      >
        <Pencil className="h-3.5 w-3.5" />
        <span className="sr-only">Editar aula</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Programação Acadêmica</DialogTitle>
          <DialogDescription>
            Altere o tipo de ocorrência, disciplina, corpo docente ou motivos da sessão.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div
              role="alert"
              className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 flex items-center gap-2 font-medium"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Campo Visual: Tipo da Ocorrência */}
          <div className="space-y-1.5">
            <Label htmlFor={`edit-tipo-ocorrencia-${aula.id}`} className="text-sm font-medium">
              Tipo de Ocorrência <span className="text-destructive">*</span>
            </Label>
            <Select
              value={tipoOcorrencia}
              onValueChange={(val) => {
                if (val) handleTipoChange(val as TipoOcorrenciaAula);
              }}
            >
              <SelectTrigger id={`edit-tipo-ocorrencia-${aula.id}`} className="w-full h-9">
                <SelectValue placeholder="Selecione o tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aula">Aula</SelectItem>
                <SelectItem value="Sem aula">Sem aula</SelectItem>
                <SelectItem value="Feriado">Feriado</SelectItem>
                <SelectItem value="Atividade especial">Atividade especial</SelectItem>
                <SelectItem value="A confirmar">A confirmar</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="tipo_ocorrencia" value={tipoOcorrencia} />
          </div>

          {/* Banner contextual de instrução */}
          {tipoOcorrencia === "Sem aula" && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <strong className="text-destructive font-semibold">Sem Aula:</strong> A disciplina será desvinculada e o dia permanecerá preservado no calendário acadêmico como suspensão/recesso.
              </div>
            </div>
          )}

          {tipoOcorrencia === "Feriado" && (
            <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-500 font-semibold">Feriado:</strong> A disciplina será desvinculada e o registro representará o recesso comemorativo oficial.
              </div>
            </div>
          )}

          {tipoOcorrencia === "A confirmar" && (
            <div className="p-3 rounded-md bg-muted/60 border border-border text-xs text-muted-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                Reserva a data na grade horária. A disciplina e o docente podem permanecer sem definição até confirmação da coordenação.
              </div>
            </div>
          )}

          {tipoOcorrencia === "Atividade especial" && (
            <div className="p-3 rounded-md bg-primary/10 border border-primary/20 text-xs text-foreground flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                Sessão com programação temática (ex: retrospectiva do semestre, conferência ou seminário geral).
              </div>
            </div>
          )}

          {/* Campo de Motivo (para Sem aula, Feriado, A confirmar, Atividade especial) */}
          {tipoOcorrencia !== "Aula" && (
            <div className="space-y-1.5">
              <Label htmlFor={`edit-motivo-${aula.id}`} className="text-sm font-medium">
                {tipoOcorrencia === "Feriado"
                  ? "Nome / Descrição do Feriado"
                  : tipoOcorrencia === "Atividade especial"
                  ? "Título da Atividade Especial"
                  : tipoOcorrencia === "Sem aula"
                  ? "Motivo da Suspensão"
                  : "Motivo / Detalhes da Pendência"}{" "}
                {(tipoOcorrencia === "Feriado" || tipoOcorrencia === "Atividade especial") && (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Input
                id={`edit-motivo-${aula.id}`}
                name="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder={
                  tipoOcorrencia === "Feriado"
                    ? "Ex: Tiradentes, Sexta-feira Santa, Natal..."
                    : tipoOcorrencia === "Sem aula"
                    ? "Ex: Sem aula, Recesso, Manutenção no local..."
                    : tipoOcorrencia === "Atividade especial"
                    ? "Ex: Retrospectiva do Semestre, Seminário de Abertura..."
                    : "Ex: Definição pendente pela coordenação..."
                }
                required={tipoOcorrencia === "Feriado" || tipoOcorrencia === "Atividade especial"}
                disabled={isPending}
                className="h-9 text-sm"
              />
            </div>
          )}

          {/* Campo Disciplina: exibido para Aula (obrigatório) ou Atividade especial / A confirmar (opcional); escondido para Sem aula / Feriado */}
          {tipoOcorrencia === "Aula" && (
            <div className="space-y-1.5">
              <Label htmlFor={`edit-disciplina-${aula.id}`} className="text-sm font-medium">
                Disciplina <span className="text-destructive">*</span>
              </Label>
              <select
                id={`edit-disciplina-${aula.id}`}
                name="disciplina_id"
                value={selectedDisciplina}
                onChange={(e) => setSelectedDisciplina(e.target.value)}
                required
                disabled={isPending}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione uma disciplina...</option>
                {disciplinas.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome} {d.carga_horaria ? `(${d.carga_horaria}h)` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(tipoOcorrencia === "Atividade especial" || tipoOcorrencia === "A confirmar") && (
            <div className="space-y-1.5">
              <Label htmlFor={`edit-disciplina-opcional-${aula.id}`} className="text-sm font-medium">
                Disciplina <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
              </Label>
              <select
                id={`edit-disciplina-opcional-${aula.id}`}
                name="disciplina_id"
                value={selectedDisciplina}
                onChange={(e) => setSelectedDisciplina(e.target.value)}
                disabled={isPending}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Nenhuma disciplina vinculada</option>
                {disciplinas.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome} {d.carga_horaria ? `(${d.carga_horaria}h)` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Campo Professor: Visível para Aula e Atividade Especial; opcional para A Confirmar; oculto para Sem Aula / Feriado */}
          {(tipoOcorrencia === "Aula" || tipoOcorrencia === "Atividade especial") && (
            <div className="space-y-1.5">
              <Label htmlFor={`edit-professor-${aula.id}`} className="text-sm font-medium">
                Professor Responsável <span className="text-destructive">*</span>
              </Label>
              <select
                id={`edit-professor-${aula.id}`}
                name="professor_id"
                value={selectedProfessor}
                onChange={(e) => setSelectedProfessor(e.target.value)}
                required
                disabled={isPending}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione um professor...</option>
                {professores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tipoOcorrencia === "A confirmar" && (
            <div className="space-y-1.5">
              <Label htmlFor={`edit-professor-opcional-${aula.id}`} className="text-sm font-medium">
                Professor Responsável <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
              </Label>
              <select
                id={`edit-professor-opcional-${aula.id}`}
                name="professor_id"
                value={selectedProfessor}
                onChange={(e) => setSelectedProfessor(e.target.value)}
                disabled={isPending}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Docente a definir</option>
                {professores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Linha com Modalidade (se aplicável), Data/Hora e Duração */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={`edit-data-hora-${aula.id}`} className="text-sm font-medium">
                Data e Horário de Início <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`edit-data-hora-${aula.id}`}
                name="data_hora"
                type="datetime-local"
                defaultValue={formatForDateTimeLocal(aula.data_hora)}
                required
                disabled={isPending}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`edit-duracao-${aula.id}`} className="text-sm font-medium">
                Duração (Minutos)
              </Label>
              <Input
                id={`edit-duracao-${aula.id}`}
                name="duracao_minutos"
                type="number"
                defaultValue={aula.duracao_minutos || 60}
                min={15}
                step={15}
                required
                disabled={isPending}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {(tipoOcorrencia === "Aula" || tipoOcorrencia === "Atividade especial") && (
            <div className="space-y-1.5">
              <Label htmlFor={`edit-modalidade-${aula.id}`} className="text-sm font-medium">
                Modalidade
              </Label>
              <select
                id={`edit-modalidade-${aula.id}`}
                name="modalidade"
                value={modalidade}
                onChange={(e) => setModalidade(e.target.value as ModalidadeAula)}
                disabled={isPending}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Presencial">Presencial</option>
                <option value="Remoto">Remoto</option>
              </select>
            </div>
          )}

          {/* Observações / Descrição Livre */}
          <div className="space-y-1.5">
            <Label htmlFor={`edit-observacoes-${aula.id}`} className="text-sm font-medium">
              Observações Adicionais <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
            </Label>
            <Textarea
              id={`edit-observacoes-${aula.id}`}
              name="observacoes"
              defaultValue={aula.observacoes || ""}
              placeholder="Ex: (Sem Aula) Casamento da Camila ou instruções complementares..."
              disabled={isPending}
              rows={2}
              className="text-sm"
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// =========================================================================
// Dialog de Agendamento / Nova Ocorrência
// =========================================================================
export function NovaAulaDialog({
  disciplinas,
  professores,
  onCreated,
}: {
  disciplinas: Disciplina[];
  professores: Professor[];
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [tipoOcorrencia, setTipoOcorrencia] = useState<TipoOcorrenciaAula>("Aula");
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("");
  const [selectedProfessor, setSelectedProfessor] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [modalidade, setModalidade] = useState<ModalidadeAula>("Presencial");

  // Fallback seguro de professor para atender restrição NOT NULL caso campo esteja oculto
  const defaultProfId = professores[0]?.id || "";

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setError(null);
      setTipoOcorrencia("Aula");
      setSelectedDisciplina("");
      setSelectedProfessor("");
      setMotivo("");
      setModalidade("Presencial");
    }
  };

  const handleTipoChange = (newTipo: TipoOcorrenciaAula) => {
    setTipoOcorrencia(newTipo);
    if (newTipo === "Sem aula") {
      setSelectedDisciplina("");
      if (!motivo) setMotivo("Sem aula");
    } else if (newTipo === "Feriado") {
      setSelectedDisciplina("");
      if (!motivo) setMotivo("");
    } else if (newTipo === "A confirmar") {
      if (!motivo) setMotivo("A confirmar");
    } else if (newTipo === "Aula") {
      setMotivo("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    formData.set("tipo_ocorrencia", tipoOcorrencia);
    if (tipoOcorrencia === "Sem aula" || tipoOcorrencia === "Feriado") {
      formData.set("disciplina_id", "");
      formData.set("professor_id", defaultProfId);
    } else {
      formData.set("disciplina_id", selectedDisciplina);
      formData.set("professor_id", selectedProfessor || defaultProfId);
    }
    formData.set("modalidade", modalidade);
    formData.set("motivo", motivo);

    startTransition(async () => {
      const res = await createAula(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setOpen(false);
        router.refresh();
        onCreated?.();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className="h-9 gap-1.5 shadow-xs" />}>
        <Plus className="h-4 w-4" />
        <span>Agendar aula</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Programação Acadêmica</DialogTitle>
          <DialogDescription>
            Registre uma aula regular, suspensão (sem aula), feriado ou atividade especial.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div
              role="alert"
              className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 flex items-center gap-2 font-medium"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Campo Visual: Tipo da Ocorrência */}
          <div className="space-y-1.5">
            <Label htmlFor="nova-tipo-ocorrencia" className="text-sm font-medium">
              Tipo de Ocorrência <span className="text-destructive">*</span>
            </Label>
            <Select
              value={tipoOcorrencia}
              onValueChange={(val) => {
                if (val) handleTipoChange(val as TipoOcorrenciaAula);
              }}
            >
              <SelectTrigger id="nova-tipo-ocorrencia" className="w-full h-9">
                <SelectValue placeholder="Selecione o tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aula">Aula</SelectItem>
                <SelectItem value="Sem aula">Sem aula</SelectItem>
                <SelectItem value="Feriado">Feriado</SelectItem>
                <SelectItem value="Atividade especial">Atividade especial</SelectItem>
                <SelectItem value="A confirmar">A confirmar</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="tipo_ocorrencia" value={tipoOcorrencia} />
          </div>

          {/* Banner contextual de instrução */}
          {tipoOcorrencia === "Sem aula" && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <strong className="text-destructive font-semibold">Sem Aula:</strong> A data será registrada no calendário como suspensão formal de aula, sem exigir disciplina ou seleção fictícia de docente.
              </div>
            </div>
          )}

          {tipoOcorrencia === "Feriado" && (
            <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-500 font-semibold">Feriado:</strong> Registra a data comemorativa no cronograma acadêmico.
              </div>
            </div>
          )}

          {tipoOcorrencia === "A confirmar" && (
            <div className="p-3 rounded-md bg-muted/60 border border-border text-xs text-muted-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                Reserva o horário na grade horária enquanto os detalhes acadêmicos são validados pela coordenação.
              </div>
            </div>
          )}

          {tipoOcorrencia === "Atividade especial" && (
            <div className="p-3 rounded-md bg-primary/10 border border-primary/20 text-xs text-foreground flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                Evento ou sessão diferenciada (ex: retrospectiva do semestre, seminário geral, palestra).
              </div>
            </div>
          )}

          {/* Campo de Motivo */}
          {tipoOcorrencia !== "Aula" && (
            <div className="space-y-1.5">
              <Label htmlFor="nova-motivo" className="text-sm font-medium">
                {tipoOcorrencia === "Feriado"
                  ? "Nome / Descrição do Feriado"
                  : tipoOcorrencia === "Atividade especial"
                  ? "Título da Atividade Especial"
                  : tipoOcorrencia === "Sem aula"
                  ? "Motivo da Suspensão"
                  : "Motivo / Detalhes da Pendência"}{" "}
                {(tipoOcorrencia === "Feriado" || tipoOcorrencia === "Atividade especial") && (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Input
                id="nova-motivo"
                name="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder={
                  tipoOcorrencia === "Feriado"
                    ? "Ex: Tiradentes, Semana Santa, Natal, Feriado nacional..."
                    : tipoOcorrencia === "Sem aula"
                    ? "Ex: Sem aula, Recesso acadêmico..."
                    : tipoOcorrencia === "Atividade especial"
                    ? "Ex: Retrospectiva do Semestre, Seminário de Abertura..."
                    : "Ex: Definição pendente pela coordenação..."
                }
                required={tipoOcorrencia === "Feriado" || tipoOcorrencia === "Atividade especial"}
                disabled={isPending}
                className="h-9 text-sm"
              />
            </div>
          )}

          {/* Disciplina: visível se Aula ou Atividade especial / A confirmar; oculta se Sem aula / Feriado */}
          {tipoOcorrencia === "Aula" && (
            <div className="space-y-1.5">
              <Label htmlFor="nova-disciplina_id" className="text-sm font-medium">
                Disciplina <span className="text-destructive">*</span>
              </Label>
              <select
                id="nova-disciplina_id"
                name="disciplina_id"
                value={selectedDisciplina}
                onChange={(e) => setSelectedDisciplina(e.target.value)}
                required
                disabled={isPending}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione uma disciplina...</option>
                {disciplinas.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome} {d.carga_horaria ? `(${d.carga_horaria}h)` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(tipoOcorrencia === "Atividade especial" || tipoOcorrencia === "A confirmar") && (
            <div className="space-y-1.5">
              <Label htmlFor="nova-disciplina-opcional" className="text-sm font-medium">
                Disciplina <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
              </Label>
              <select
                id="nova-disciplina-opcional"
                name="disciplina_id"
                value={selectedDisciplina}
                onChange={(e) => setSelectedDisciplina(e.target.value)}
                disabled={isPending}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Nenhuma disciplina vinculada</option>
                {disciplinas.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome} {d.carga_horaria ? `(${d.carga_horaria}h)` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Professor: visível se Aula ou Atividade especial; opcional se A confirmar; oculto se Sem aula / Feriado */}
          {(tipoOcorrencia === "Aula" || tipoOcorrencia === "Atividade especial") && (
            <div className="space-y-1.5">
              <Label htmlFor="nova-professor_id" className="text-sm font-medium">
                Professor Responsável <span className="text-destructive">*</span>
              </Label>
              <select
                id="nova-professor_id"
                name="professor_id"
                value={selectedProfessor}
                onChange={(e) => setSelectedProfessor(e.target.value)}
                required
                disabled={isPending}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione um professor...</option>
                {professores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tipoOcorrencia === "A confirmar" && (
            <div className="space-y-1.5">
              <Label htmlFor="nova-professor-opcional" className="text-sm font-medium">
                Professor Responsável <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
              </Label>
              <select
                id="nova-professor-opcional"
                name="professor_id"
                value={selectedProfessor}
                onChange={(e) => setSelectedProfessor(e.target.value)}
                disabled={isPending}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Docente a definir</option>
                {professores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Data e Horário / Duração */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nova-data_hora" className="text-sm font-medium">
                Data e Horário de Início <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nova-data_hora"
                name="data_hora"
                type="datetime-local"
                required
                disabled={isPending}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nova-duracao_minutos" className="text-sm font-medium">
                Duração (Minutos)
              </Label>
              <Input
                id="nova-duracao_minutos"
                name="duracao_minutos"
                type="number"
                defaultValue={60}
                min={15}
                step={15}
                required
                disabled={isPending}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {(tipoOcorrencia === "Aula" || tipoOcorrencia === "Atividade especial") && (
            <div className="space-y-1.5">
              <Label htmlFor="nova-modalidade" className="text-sm font-medium">
                Modalidade
              </Label>
              <select
                id="nova-modalidade"
                name="modalidade"
                value={modalidade}
                onChange={(e) => setModalidade(e.target.value as ModalidadeAula)}
                disabled={isPending}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Presencial">Presencial</option>
                <option value="Remoto">Remoto</option>
              </select>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-1.5">
            <Label htmlFor="nova-observacoes" className="text-sm font-medium">
              Observações Adicionais <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
            </Label>
            <Textarea
              id="nova-observacoes"
              name="observacoes"
              placeholder="Ex: (Sem Aula) Casamento da Camila ou orientações para a turma..."
              disabled={isPending}
              rows={2}
              className="text-sm"
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agendando...
                </>
              ) : (
                "Confirmar Agendamento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// =========================================================================
// Diálogo de Exclusão de Aula / Sessão
// =========================================================================
export function DeleteAulaDialog({
  id,
  disciplinaNome,
  dataHora,
}: {
  id: string;
  disciplinaNome?: string;
  dataHora: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const formattedDate = () => {
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(dataHora));
    } catch {
      return dataHora;
    }
  };

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteAula(id);
      if (res.error) {
        setError(res.error);
      } else {
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Cancelar programação"
          />
        }
      >
        <Trash2 className="h-4 w-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar Sessão da Programação</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja cancelar o registro de{" "}
            <strong className="text-foreground">
              {disciplinaNome || "Sessão"} ({formattedDate()})
            </strong>? Esta ocorrência será removida da programação e do calendário acadêmico.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Voltar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              "Confirmar Exclusão"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// =========================================================================
// Tabela Responsiva com Toolbar de Filtros Client-side
// =========================================================================
export function AulasList({
  aulas,
  disciplinas,
  professores,
  initialSearch = "",
}: {
  aulas: Aula[];
  disciplinas: Disciplina[];
  professores: Professor[];
  initialSearch?: string;
}) {
  const [search, setSearch] = useState(() => {
    if (initialSearch) return initialSearch;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) return q;
    }
    return "";
  });
  const [prevInitialSearch, setPrevInitialSearch] = useState(initialSearch);
  const [filterDisciplina, setFilterDisciplina] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Ajusta estado caso a prop initialSearch mude durante a navegação
  if (initialSearch !== prevInitialSearch) {
    setPrevInitialSearch(initialSearch);
    setSearch(initialSearch);
    setCurrentPage(1);
  }

  const filtered = aulas.filter((aula) => {
    const term = search.toLowerCase().trim();
    const discNome = aula.disciplina?.nome?.toLowerCase() || "";
    const profNome = aula.professor?.nome?.toLowerCase() || "";
    const motivo = aula.motivo?.toLowerCase() || "";
    const observacoes = aula.observacoes?.toLowerCase() || "";
    const tipo = aula.tipo_ocorrencia?.toLowerCase() || "";
    const situacao = aula.situacao?.toLowerCase() || "";

    const matchesSearch =
      !term ||
      discNome.includes(term) ||
      profNome.includes(term) ||
      motivo.includes(term) ||
      observacoes.includes(term) ||
      tipo.includes(term) ||
      situacao.includes(term);

    const matchesDisciplina = !filterDisciplina || aula.disciplina_id === filterDisciplina;

    return matchesSearch && matchesDisciplina;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const formatHorario = (dataHoraStr: string, duracaoMin: number) => {
    try {
      const inicio = new Date(dataHoraStr);
      const fim = new Date(inicio.getTime() + duracaoMin * 60000);
      const dataFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(inicio);
      const horaInicioFmt = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(inicio);
      const horaFimFmt = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(fim);

      return {
        data: dataFmt,
        horario: `${horaInicioFmt} às ${horaFimFmt}`,
      };
    } catch {
      return { data: dataHoraStr, horario: `${duracaoMin} min` };
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar com Busca, Filtro de Disciplina e Contadores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-xl">
          {/* Busca por texto */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por disciplina, professor, motivo ou observações..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9 text-sm"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por disciplina */}
          <div className="w-full sm:w-52 shrink-0">
            <select
              value={filterDisciplina}
              onChange={(e) => {
                setFilterDisciplina(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filtrar por disciplina"
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todas as disciplinas</option>
              {disciplinas.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-muted-foreground sm:text-right">
          {search || filterDisciplina ? (
            <span>
              Encontradas: <strong className="text-foreground">{filtered.length}</strong> de {aulas.length}
            </span>
          ) : (
            <span>
              Total: <strong className="text-foreground">{aulas.length}</strong> {aulas.length === 1 ? "sessão" : "sessões"}
            </span>
          )}
        </div>
      </div>

      {/* Tabela ou Estado Vazio */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        {paginated.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <CalendarDays className="h-9 w-9 text-muted-foreground/40 mb-3" />
            {search || filterDisciplina ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  Nenhuma sessão encontrada para os filtros selecionados
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Redefina a busca ou selecione outra disciplina.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setFilterDisciplina("");
                  }}
                  className="mt-4 h-8 text-xs"
                >
                  Limpar filtros
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">
                  Nenhuma aula programada no momento
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Programe as sessões de aula vinculando os professores às disciplinas cadastradas para alimentar o calendário acadêmico.
                </p>
                <div className="mt-4">
                  <NovaAulaDialog disciplinas={disciplinas} professores={professores} />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[200px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Data e Horário
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ocorrência / Disciplina
                  </TableHead>
                  <TableHead className="w-[180px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Professor Responsável
                  </TableHead>
                  <TableHead className="w-[110px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Duração
                  </TableHead>
                  <TableHead className="w-[100px] text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((aula) => {
                  const { data, horario } = formatHorario(aula.data_hora, aula.duracao_minutos);
                  const tipo = aula.tipo_ocorrencia || (
                    aula.situacao === "Sem aula" ? "Sem aula" : 
                    aula.situacao === "Feriado" ? "Feriado" : 
                    aula.situacao === "A confirmar" ? "A confirmar" : "Aula"
                  );
                  const isSemAula = tipo === "Sem aula" || aula.situacao === "Sem aula";
                  const isFeriado = tipo === "Feriado" || aula.situacao === "Feriado";
                  const isAConfirmar = tipo === "A confirmar" || aula.situacao === "A confirmar";
                  const isAtividadeEspecial = tipo === "Atividade especial";

                  return (
                    <TableRow
                      key={aula.id}
                      className={`transition-colors ${
                        isSemAula
                          ? "bg-destructive/5 hover:bg-destructive/10"
                          : isFeriado
                          ? "bg-amber-500/5 hover:bg-amber-500/10"
                          : isAConfirmar
                          ? "bg-muted/40 hover:bg-muted/60"
                          : isAtividadeEspecial
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium text-foreground">{data}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {horario}
                          </span>
                        </div>
                      </TableCell>

                      {/* Coluna Diferenciada de Ocorrência / Disciplina */}
                      <TableCell>
                        {isSemAula ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5 h-4.5">
                                Sem aula
                              </Badge>
                              <span className="font-semibold text-foreground text-sm">
                                {aula.motivo && aula.motivo !== "Sem aula" ? aula.motivo : "Sem aula programada"}
                              </span>
                            </div>
                            {aula.observacoes && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{aula.observacoes}</p>
                            )}
                          </div>
                        ) : isFeriado ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Badge variant="warning" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5 h-4.5">
                                Feriado
                              </Badge>
                              <span className="font-semibold text-foreground text-sm">
                                {aula.motivo || "Feriado"}
                              </span>
                            </div>
                            {aula.observacoes && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{aula.observacoes}</p>
                            )}
                          </div>
                        ) : isAConfirmar ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground border-dashed py-0 px-1.5 h-4.5">
                                A confirmar
                              </Badge>
                              <span className="font-semibold text-foreground text-sm">
                                {aula.disciplina?.nome || aula.motivo || "Definição pendente"}
                              </span>
                            </div>
                            {aula.observacoes && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{aula.observacoes}</p>
                            )}
                          </div>
                        ) : isAtividadeEspecial ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5 h-4.5">
                                Atividade Especial
                              </Badge>
                              <span className="font-semibold text-foreground text-sm">
                                {aula.motivo || aula.disciplina?.nome || "Atividade Especial"}
                              </span>
                            </div>
                            {aula.disciplina?.nome && aula.motivo && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                Disciplina: {aula.disciplina.nome}
                              </p>
                            )}
                            {aula.observacoes && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{aula.observacoes}</p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="font-medium text-foreground">
                              {aula.disciplina?.nome || <span className="text-muted-foreground/50">—</span>}
                            </span>
                            {aula.observacoes && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{aula.observacoes}</p>
                            )}
                          </div>
                        )}
                      </TableCell>

                      {/* Coluna Professor */}
                      <TableCell className="text-sm">
                        {isSemAula || isFeriado ? (
                          <span className="text-muted-foreground/50 text-xs italic">—</span>
                        ) : isAConfirmar && !aula.professor?.nome ? (
                          <span className="text-muted-foreground/60 text-xs italic">A definir</span>
                        ) : (
                          <span className="text-muted-foreground">{aula.professor?.nome || <span className="text-muted-foreground/50">—</span>}</span>
                        )}
                      </TableCell>

                      {/* Coluna Duração */}
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-xs">
                          {aula.duracao_minutos} min
                        </Badge>
                      </TableCell>

                      {/* Coluna Ações */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditarAulaDialog
                            aula={aula}
                            disciplinas={disciplinas}
                            professores={professores}
                          />
                          <DeleteAulaDialog
                            id={aula.id}
                            disciplinaNome={
                              isSemAula
                                ? `Sem aula (${aula.observacoes || aula.motivo || "Recesso"})`
                                : isFeriado
                                ? `Feriado (${aula.motivo || "Feriado"})`
                                : isAtividadeEspecial
                                ? `Atividade Especial (${aula.motivo || aula.disciplina?.nome || ""})`
                                : isAConfirmar
                                ? `A confirmar (${aula.motivo || aula.disciplina?.nome || "Pendente"})`
                                : aula.disciplina?.nome
                            }
                            dataHora={aula.data_hora}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Paginação se houver mais de uma página */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
