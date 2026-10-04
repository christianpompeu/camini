"use client";

import React, { useState, useTransition } from "react";
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Search, 
  CalendarDays, 
  Clock, 
  X, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createAula, deleteAula, type Aula, type Disciplina, type Professor } from "../actions";

// =========================================================================
// Dialog de Agendamento de Aula
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
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createAula(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setOpen(false);
        onCreated?.();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="h-9 gap-1.5 shadow-xs" />}>
        <Plus className="h-4 w-4" />
        <span>Agendar aula</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agendar Nova Aula</DialogTitle>
          <DialogDescription>
            Defina a disciplina, professor responsável, data e duração da sessão.
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

          <div className="space-y-1.5">
            <Label htmlFor="disciplina_id" className="text-sm font-medium">
              Disciplina <span className="text-destructive">*</span>
            </Label>
            <select
              id="disciplina_id"
              name="disciplina_id"
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

          <div className="space-y-1.5">
            <Label htmlFor="professor_id" className="text-sm font-medium">
              Professor Responsável <span className="text-destructive">*</span>
            </Label>
            <select
              id="professor_id"
              name="professor_id"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="data_hora" className="text-sm font-medium">
                Data e Horário de Início <span className="text-destructive">*</span>
              </Label>
              <Input
                id="data_hora"
                name="data_hora"
                type="datetime-local"
                required
                disabled={isPending}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duracao_minutos" className="text-sm font-medium">
                Duração (Minutos)
              </Label>
              <Input
                id="duracao_minutos"
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
// Diálogo de Exclusão de Aula
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
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Cancelar aula agendada"
          />
        }
      >
        <Trash2 className="h-4 w-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar Aula Agendada</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja cancelar a aula de{" "}
            <strong className="text-foreground">
              {disciplinaNome || "Disciplina"} ({formattedDate()})
            </strong>? Esta sessão será removida imediatamente da programação e do calendário público.
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
              "Confirmar Cancelamento"
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
}: {
  aulas: Aula[];
  disciplinas: Disciplina[];
  professores: Professor[];
}) {
  const [search, setSearch] = useState("");
  const [filterDisciplina, setFilterDisciplina] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = aulas.filter((aula) => {
    const term = search.toLowerCase().trim();
    const discNome = aula.disciplina?.nome?.toLowerCase() || "";
    const profNome = aula.professor?.nome?.toLowerCase() || "";

    const matchesSearch = !term || discNome.includes(term) || profNome.includes(term);
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
              placeholder="Buscar por disciplina ou professor..."
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
              Total: <strong className="text-foreground">{aulas.length}</strong> {aulas.length === 1 ? "aula" : "aulas"}
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
                  Nenhuma aula encontrada para os filtros selecionados
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
                  <TableHead className="w-[240px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Data e Horário
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Disciplina
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Professor Responsável
                  </TableHead>
                  <TableHead className="w-[120px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                  return (
                    <TableRow
                      key={aula.id}
                      className="hover:bg-muted/30 transition-colors"
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
                      <TableCell className="font-medium text-foreground">
                        {aula.disciplina?.nome || <span className="text-muted-foreground/50">—</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {aula.professor?.nome || <span className="text-muted-foreground/50">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-xs">
                          {aula.duracao_minutos} min
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteAulaDialog
                          id={aula.id}
                          disciplinaNome={aula.disciplina?.nome}
                          dataHora={aula.data_hora}
                        />
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
