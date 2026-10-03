"use client";

import React, { useActionState, useState, useTransition } from "react";
import { Plus, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAula, deleteAula } from "../actions";
import type { Disciplina, Professor } from "../actions";

export function AulaForm({ disciplinas, professores }: { disciplinas: Disciplina[], professores: Professor[] }) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await createAula(formData);
      return result;
    },
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex gap-4 items-start flex-wrap">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Disciplina</label>
          <select name="disciplina_id" required disabled={isPending} className="flex h-10 w-full rounded-md border border-outline dark:border-slate-700 bg-surface dark:bg-slate-800 px-3 py-2 text-sm text-text-primary dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-energy-blue">
            <option value="">Selecione...</option>
            {disciplinas.map(d => (
              <option key={d.id} value={d.id}>{d.nome}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Professor</label>
          <select name="professor_id" required disabled={isPending} className="flex h-10 w-full rounded-md border border-outline dark:border-slate-700 bg-surface dark:bg-slate-800 px-3 py-2 text-sm text-text-primary dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-energy-blue">
            <option value="">Selecione...</option>
            {professores.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1 flex-1 min-w-[180px]">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Data e Hora</label>
          <Input name="data_hora" type="datetime-local" required disabled={isPending} />
        </div>
        <div className="space-y-1 w-28">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Duração (m)</label>
          <Input name="duracao_minutos" type="number" defaultValue="60" min="1" disabled={isPending} />
        </div>
        <div className="pt-5">
          <Button variant="camini" type="submit" className="h-10 px-6" disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {isPending ? "Agendando..." : "Agendar"}
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
          Aula agendada com sucesso!
        </div>
      )}
    </form>
  );
}

export function DeleteAulaButton({ id }: { id: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAula(id);
      if (result.error) {
        setError(result.error);
        setIsConfirming(false);
      }
    });
  };

  if (isConfirming) {
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Excluir?</span>
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
