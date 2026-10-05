"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { getCtcDependencyCount, type CtcDependencyType } from "./actions";

export interface DeleteWithDependencyCheckDialogProps {
  id: string;
  name: string;
  type: CtcDependencyType;
  onDelete: (id: string) => Promise<{ success?: boolean; error?: string }>;
  onDeleted?: (id: string) => void;
  trigger?: React.ReactNode;
}

export function DeleteWithDependencyCheckDialog({
  id,
  name,
  type,
  onDelete,
  onDeleted,
  trigger,
}: DeleteWithDependencyCheckDialogProps) {
  const [open, setOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [dependencyCount, setDependencyCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isProfessor = type === "professor";
  const article = isProfessor ? "este professor" : "esta disciplina";
  const pronoun = isProfessor ? "excluí-lo" : "excluí-la";
  const label = isProfessor ? "professor" : "disciplina";

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setIsChecking(true);
      setDependencyCount(null);
      setError(null);

      getCtcDependencyCount({ type, id })
        .then((res) => {
          setIsChecking(false);
          if (res.error) {
            setError(res.error);
          } else {
            setDependencyCount(res.count);
          }
        })
        .catch(() => {
          setIsChecking(false);
          setError("Não foi possível verificar os vínculos no momento.");
        });
    } else {
      // Limpa erros ao fechar
      setError(null);
    }
  };

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await onDelete(id);
        if (res?.error) {
          setError(res.error);
          toast.error(res.error);
        } else {
          toast.success(
            isProfessor
              ? "Professor excluído com sucesso."
              : "Disciplina excluída com sucesso."
          );
          setOpen(false);
          onDeleted?.(id);
        }
      } catch {
        const fallbackMsg = "Ocorreu um erro inesperado ao tentar excluir.";
        setError(fallbackMsg);
        toast.error(fallbackMsg);
      }
    });
  };

  const isBlocked = dependencyCount !== null && dependencyCount > 0;
  const isBlockedByFkError = error?.includes("aulas vinculadas");

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title={`Excluir ${name}`}
            />
          )
        }
      >
        {!trigger && <Trash2 className="h-4 w-4" />}
      </AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-md">
        {isChecking ? (
          // ===============================================================
          // Estado de Loading Discreto (consulta prévia de dependências)
          // ===============================================================
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Verificando vínculos...</AlertDialogTitle>
              <AlertDialogDescription className="sr-only">
                Consultando se existem aulas vinculadas a este registro antes de permitir a exclusão.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Consultando aulas vinculadas no sistema...
              </p>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
            </AlertDialogFooter>
          </>
        ) : isBlocked ? (
          // ===============================================================
          // Estado Bloqueado: Existem Aulas Vinculadas (Exclusão Negada)
          // ===============================================================
          <>
            <AlertDialogHeader>
              <div className="mb-2 inline-flex size-10 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-5" />
              </div>
              <AlertDialogTitle>
                Não é possível excluir {article}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left text-sm pt-1 space-y-2">
                <span className="block text-foreground font-medium">
                  {isProfessor ? "Este professor" : "Esta disciplina"} possui{" "}
                  <strong>
                    {dependencyCount}{" "}
                    {dependencyCount === 1 ? "aula vinculada" : "aulas vinculadas"}
                  </strong>
                  .
                </span>
                <span className="block text-xs text-muted-foreground">
                  Para {pronoun}, primeiro transfira ou remova as aulas relacionadas.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel>Fechar</AlertDialogCancel>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                render={
                  <Link
                    href={`/dashboard/ctc/aulas?q=${encodeURIComponent(name)}`}
                    onClick={() => setOpen(false)}
                  />
                }
              >
                <CalendarDays className="h-4 w-4" />
                <span>Ver aulas vinculadas</span>
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          // ===============================================================
          // Estado Liberado: Confirmação Normal de Exclusão (0 Aulas)
          // ===============================================================
          <>
            <AlertDialogHeader>
              <div className="mb-2 inline-flex size-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <AlertCircle className="size-5" />
              </div>
              <AlertDialogTitle>
                Excluir {label}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left text-sm pt-1 space-y-2">
                <span className="block text-foreground">
                  Tem certeza que deseja excluir “<strong>{name}</strong>”?
                </span>
                <span className="block text-xs text-muted-foreground">
                  Esta ação não poderá ser desfeita.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>

            {error && (
              <div
                role="alert"
                className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 flex flex-col gap-2 font-medium"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                {isBlockedByFkError && (
                  <div className="pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs border-destructive/30 hover:bg-destructive/20 text-destructive"
                      render={
                        <Link
                          href={`/dashboard/ctc/aulas?q=${encodeURIComponent(name)}`}
                          onClick={() => setOpen(false)}
                        />
                      }
                    >
                      <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                      Ver aulas vinculadas
                    </Button>
                  </div>
                )}
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>
                Cancelar
              </AlertDialogCancel>

              {!isBlockedByFkError && (
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
                    "Excluir"
                  )}
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
