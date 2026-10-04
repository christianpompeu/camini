import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, BookPlus } from "lucide-react";
import { getDisciplinas } from "../actions";
import { DisciplinaForm, DeleteDisciplinaButton } from "./client-components";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function DisciplinasPage() {
  const disciplinas = await getDisciplinas();

  return (
    <div className="space-y-6">
      {/* Header com Breadcrumb, Ícone e Botão de Voltar com Gradiente de Destaque */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">
            <Link href="/dashboard" className="hover:text-energy-blue transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href="/dashboard/ctc" className="hover:text-energy-blue transition-colors">Gestão CTC</Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Disciplinas</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-camini text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Disciplinas</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Grade curricular do CTC</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Cadastro */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-camini text-white flex items-center justify-center shadow-sm shrink-0">
            <BookPlus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">Adicionar Disciplina</h2>
        </div>
        <DisciplinaForm />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-camini text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
              Disciplinas na Grade
            </h3>
          </div>
        </div>
        {disciplinas.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Nenhuma disciplina cadastrada ainda.
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-slate-800/60 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-[300px]">Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Carga Horária</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disciplinas.map((disc) => (
                  <TableRow key={disc.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">{disc.nome}</TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400">{disc.descricao || "-"}</TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400">{disc.carga_horaria ? `${disc.carga_horaria}h` : "-"}</TableCell>
                    <TableCell className="text-right">
                      <DeleteDisciplinaButton id={disc.id} nome={disc.nome} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800 flex justify-end bg-gray-50/30 dark:bg-slate-800/20">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-camini-cyan/10 text-camini-cobalt dark:text-camini-cyan border border-camini-cyan/20">
            Total: {disciplinas.length} {disciplinas.length === 1 ? "disciplina" : "disciplinas"}
          </span>
        </div>
      </div>
    </div>
  );
}

