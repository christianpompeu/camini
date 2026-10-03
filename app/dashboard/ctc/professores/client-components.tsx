"use client";

import React, { useActionState, useState, useTransition } from "react";
import { Plus, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProfessor, deleteProfessor } from "../actions";

export function ProfessorForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await createProfessor(formData);
      return result;
    },
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex gap-4 items-start flex-wrap">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label htmlFor="nome" className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Nome</label>
          <Input id="nome" name="nome" placeholder="Nome do Professor" required disabled={isPending} />
        </div>
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label htmlFor="email" className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Email</label>
          <Input id="email" name="email" type="email" placeholder="Email (opcional)" disabled={isPending} />
        </div>
        <div className="space-y-1 flex-1 min-w-[150px]">
          <label htmlFor="telefone" className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Telefone</label>
          <Input id="telefone" name="telefone" placeholder="(11) 99999-9999" disabled={isPending} />
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
          Professor cadastrado com sucesso!
        </div>
      )}
    </form>
  );
}

export function DeleteProfessorButton({ id, nome }: { id: string, nome: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProfessor(id);
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
