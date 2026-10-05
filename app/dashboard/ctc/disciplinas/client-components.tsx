"use client";

import React, { useState, useTransition } from "react";
import { 
  Plus, 
  Loader2, 
  Search, 
  BookOpen, 
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createDisciplina, deleteDisciplina, type Disciplina } from "../actions";
import { DeleteWithDependencyCheckDialog } from "../delete-dependency-dialog";

// =========================================================================
// Dialog de Criação de Disciplina
// =========================================================================
export function NovaDisciplinaDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createDisciplina(formData);
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
        <span>Nova disciplina</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Disciplina</DialogTitle>
          <DialogDescription>
            Adicione uma matéria à grade curricular do CTC.
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
            <Label htmlFor="nome" className="text-sm font-medium">
              Nome da Disciplina <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nome"
              name="nome"
              placeholder="Ex: Teologia Sistemática I"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao" className="text-sm font-medium">
              Descrição / Ementa
            </Label>
            <Input
              id="descricao"
              name="descricao"
              placeholder="Breve ementa ou tópicos da matéria"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="carga_horaria" className="text-sm font-medium">
              Carga Horária Total (Horas)
            </Label>
            <Input
              id="carga_horaria"
              name="carga_horaria"
              type="number"
              min="1"
              placeholder="Ex: 40"
              disabled={isPending}
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
                "Salvar Disciplina"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// =========================================================================
// Diálogo de Exclusão de Disciplina com Verificação Prévia de Vínculos
// =========================================================================
export function DeleteDisciplinaDialog({
  id,
  nome,
  onDeleted,
}: {
  id: string;
  nome: string;
  onDeleted?: (id: string) => void;
}) {
  return (
    <DeleteWithDependencyCheckDialog
      id={id}
      name={nome}
      type="disciplina"
      onDelete={deleteDisciplina}
      onDeleted={onDeleted}
    />
  );
}

// =========================================================================
// Tabela Responsiva com Toolbar de Busca Client-side
// =========================================================================
export function DisciplinasList({
  disciplinas,
}: {
  disciplinas: Disciplina[];
}) {
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleDeleted = (deletedId: string) => {
    setDeletedIds((prev) => [...prev, deletedId]);
  };

  const visibleDisciplinas = disciplinas.filter((d) => !deletedIds.includes(d.id));

  const filtered = visibleDisciplinas.filter((d) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      d.nome.toLowerCase().includes(term) ||
      (d.descricao && d.descricao.toLowerCase().includes(term))
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-4">
      {/* Toolbar com Busca e Contadores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou ementa..."
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

        <div className="text-xs text-muted-foreground sm:text-right">
          {search ? (
            <span>
              Encontradas: <strong className="text-foreground">{filtered.length}</strong> de {visibleDisciplinas.length}
            </span>
          ) : (
            <span>
              Total: <strong className="text-foreground">{visibleDisciplinas.length}</strong> {visibleDisciplinas.length === 1 ? "disciplina" : "disciplinas"}
            </span>
          )}
        </div>
      </div>

      {/* Tabela ou Estado Vazio */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        {paginated.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <BookOpen className="h-9 w-9 text-muted-foreground/40 mb-3" />
            {search ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  Nenhuma disciplina encontrada para &quot;{search}&quot;
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tente alterar os termos da busca.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearch("")}
                  className="mt-4 h-8 text-xs"
                >
                  Limpar busca
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">
                  Nenhuma disciplina cadastrada na grade
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Comece adicionando as matérias e ementas do curso para estruturar o currículo acadêmico do CTC.
                </p>
                <div className="mt-4">
                  <NovaDisciplinaDialog />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[300px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nome
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Descrição / Ementa
                  </TableHead>
                  <TableHead className="w-[140px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Carga Horária
                  </TableHead>
                  <TableHead className="w-[100px] text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((disc) => (
                  <TableRow
                    key={disc.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">
                      {disc.nome}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {disc.descricao || <span className="text-muted-foreground/50">—</span>}
                    </TableCell>
                    <TableCell>
                      {disc.carga_horaria ? (
                        <Badge variant="secondary" className="font-normal text-xs">
                          {disc.carga_horaria} horas
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/50 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteDisciplinaDialog
                        id={disc.id}
                        nome={disc.nome}
                        onDeleted={handleDeleted}
                      />
                    </TableCell>
                  </TableRow>
                ))}
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
