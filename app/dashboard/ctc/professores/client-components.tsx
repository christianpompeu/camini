"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Pencil,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createProfessor, updateProfessor, deleteProfessor, type Professor } from "../actions";
import { DeleteWithDependencyCheckDialog } from "../delete-dependency-dialog";

// =========================================================================
// Dialog de Edição de Professor
// =========================================================================
export function EditarProfessorDialog({
  professor,
  onUpdated,
}: {
  professor: Professor;
  onUpdated?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateProfessor(professor.id, formData);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title={`Editar ${professor.nome}`}
          />
        }
      >
        <Pencil className="h-3.5 w-3.5" />
        <span className="sr-only">Editar {professor.nome}</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Professor</DialogTitle>
          <DialogDescription>
            Atualize as informações do docente no CTC.
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
            <Label htmlFor={`edit-nome-${professor.id}`} className="text-sm font-medium">
              Nome Completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`edit-nome-${professor.id}`}
              name="nome"
              defaultValue={professor.nome}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`edit-email-${professor.id}`} className="text-sm font-medium">
              E-mail
            </Label>
            <Input
              id={`edit-email-${professor.id}`}
              name="email"
              type="email"
              defaultValue={professor.email || ""}
              placeholder="carlos.eduardo@exemplo.com"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`edit-telefone-${professor.id}`} className="text-sm font-medium">
              Telefone / WhatsApp
            </Label>
            <Input
              id={`edit-telefone-${professor.id}`}
              name="telefone"
              defaultValue={professor.telefone || ""}
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
// Botão e Diálogo de Exclusão com Verificação Prévia de Vínculos
// =========================================================================
export function DeleteProfessorDialog({
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
      type="professor"
      onDelete={deleteProfessor}
      onDeleted={onDeleted}
    />
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
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleDeleted = (deletedId: string) => {
    setDeletedIds((prev) => [...prev, deletedId]);
  };

  const visibleProfessores = professores.filter((p) => !deletedIds.includes(p.id));

  // Filtro client-side por nome, email ou telefone
  const filtered = visibleProfessores.filter((p) => {
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
              Encontrados: <strong className="text-foreground">{filtered.length}</strong> de {visibleProfessores.length}
            </span>
          ) : (
            <span>
              Total: <strong className="text-foreground">{visibleProfessores.length}</strong> {visibleProfessores.length === 1 ? "professor" : "professores"}
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
                  <TableHead className="w-[110px] text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                      <div className="flex items-center justify-end gap-1">
                        <EditarProfessorDialog professor={prof} />
                        <DeleteProfessorDialog
                          id={prof.id}
                          nome={prof.nome}
                          onDeleted={handleDeleted}
                        />
                      </div>
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
