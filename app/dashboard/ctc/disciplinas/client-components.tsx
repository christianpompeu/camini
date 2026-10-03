"use client";

import React, { useActionState, useState, useTransition } from "react";
import { Plus, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDisciplina, deleteDisciplina } from "../actions";

export function DisciplinaForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await createDisciplina(formData);
      return result;
    },
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex gap-4 items-start flex-wrap">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label htmlFor="nome" className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Nome</label>
          <Input id="nome" name="nome" placeholder="Nome da Disciplina" required disabled={isPending} />
        </div>
        <div className="space-y-1 flex-1 min-w-[250px]">
          <label htmlFor="descricao" className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Descrição</label>
          <Input id="descricao" name="descricao" placeholder="Breve descrição" disabled={isPending} />
        </div>
        <div className="space-y-1 w-32">
          <label htmlFor="carga_horaria" className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Carga (h)</label>
          <Input id="carga_horaria" name="carga_horaria" type="number" placeholder="40" min="1" disabled={isPending} />
        </div>
        <div className="pt-5">
          <Button variant="camini" type="submit" className="h-10 px-6" disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {isPending ? "Salvando..." : "Adicionar"}
          </Button>
        </div>
      </div>
      
      {/* Feedback Messages */}
      {state?.error && (
        <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 p-2 rounded-lg border border-red-100 dark:border-red-900/50 flex items-center">
          <X className="w-4 h-4 mr-2" />
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="text-green-600 text-sm bg-green-50 dark:bg-green-950/30 p-2 rounded-lg border border-green-100 dark:border-green-900/50 flex items-center">
          <Check className="w-4 h-4 mr-2" />
          Disciplina cadastrada com sucesso!
        </div>
      )}
    </form>
  );
}

export function DeleteDisciplinaButton({ id, nome }: { id: string, nome: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteDisciplina(id);
      if (result.error) {
        setError(result.error);
        setIsConfirming(false);
      }
    });
  };

  if (isConfirming) {
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Excluir {nome}?</span>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => setIsConfirming(false)} 
          disabled={isPending}
          className="h-8 px-2 text-xs"
        >
          Cancelar
        </Button>
        <Button 
          variant="camini" 
          size="sm" 
          onClick={handleDelete}
          disabled={isPending}
          className="h-8 px-2 text-xs bg-red-500 hover:bg-red-600 border-none text-white"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirmar"}
        </Button>
        {error && <span className="text-red-500 text-xs absolute right-0 -bottom-5">{error}</span>}
      </div>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => setIsConfirming(true)}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 w-8 p-0"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
