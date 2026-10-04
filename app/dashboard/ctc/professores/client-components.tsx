"use client";

import React, { useState, useTransition } from "react";
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Search, 
  Users, 
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
import { createProfessor, deleteProfessor, type Professor } from "../actions";

// =========================================================================
// Dialog de Criação de Professor
// =========================================================================
export function NovoProfessorDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createProfessor(formData);
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
        <span>Novo professor</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Professor</DialogTitle>
          <DialogDescription>
            Adicione um docente ao corpo acadêmico do CTC.
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
              Nome Completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nome"
              name="nome"
              placeholder="Ex: Prof. Dr. Carlos Eduardo"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="carlos.eduardo@exemplo.com"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telefone" className="text-sm font-medium">
              Telefone / WhatsApp
            </Label>
            <Input
              id="telefone"
              name="telefone"
              placeholder="(11) 98765-4321"
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
                "Salvar Professor"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// =========================================================================
// Botão e Diálogo de Exclusão com AlertDialog
// =========================================================================
export function DeleteProfessorDialog({
  id,
  nome,
}: {
  id: string;
  nome: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteProfessor(id);
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
            title={`Excluir ${nome}`}
          />
        }
      >
        <Trash2 className="h-4 w-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Professor</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover o cadastro de{" "}
            <strong className="text-foreground">{nome}</strong>? Esta ação não pode ser desfeita e pode afetar as aulas agendadas associadas.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
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
                Excluindo...
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
// Tabela Responsiva com Toolbar de Busca Client-side
// =========================================================================
export function ProfessoresList({
  professores,
}: {
  professores: Professor[];
}) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtro client-side por nome, email ou telefone
  const filtered = professores.filter((p) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      p.nome.toLowerCase().includes(term) ||
      (p.email && p.email.toLowerCase().includes(term)) ||
      (p.telefone && p.telefone.toLowerCase().includes(term))
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
            placeholder="Buscar por nome, email ou telefone..."
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
              Encontrados: <strong className="text-foreground">{filtered.length}</strong> de {professores.length}
            </span>
          ) : (
            <span>
              Total: <strong className="text-foreground">{professores.length}</strong> {professores.length === 1 ? "professor" : "professores"}
            </span>
          )}
        </div>
      </div>

      {/* Tabela ou Estado Vazio */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        {paginated.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <Users className="h-9 w-9 text-muted-foreground/40 mb-3" />
            {search ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  Nenhum professor encontrado para &quot;{search}&quot;
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
                  Nenhum professor cadastrado ainda
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Comece adicionando os docentes do CTC para permitir a vinculação com disciplinas e agendamentos de aulas.
                </p>
                <div className="mt-4">
                  <NovoProfessorDialog />
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
                    E-mail
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Telefone
                  </TableHead>
                  <TableHead className="w-[100px] text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((prof) => (
                  <TableRow
                    key={prof.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">
                      {prof.nome}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {prof.email || <span className="text-muted-foreground/50">—</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {prof.telefone || <span className="text-muted-foreground/50">—</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteProfessorDialog id={prof.id} nome={prof.nome} />
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
