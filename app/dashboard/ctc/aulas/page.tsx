import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ArrowLeft, CalendarDays, CalendarPlus } from "lucide-react";
import { getAulas, getDisciplinas, getProfessores } from "../actions";
import { AulaForm, DeleteAulaButton } from "./client-components";

export default async function AulasPage() {
  const aulas = await getAulas();
  const disciplinas = await getDisciplinas();
  const professores = await getProfessores();

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
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Aulas</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-camini text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <CalendarDays className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Aulas</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Programação de aulas e alocação de professores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Cadastro */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-camini text-white flex items-center justify-center shadow-sm shrink-0">
            <CalendarPlus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">Agendar Aula</h2>
        </div>
        <AulaForm disciplinas={disciplinas} professores={professores} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-camini text-white flex items-center justify-center shadow-xs shrink-0">
              <CalendarDays className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
              Aulas Programadas
            </h3>
          </div>
        </div>
        {aulas.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Nenhuma aula agendada.
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-gray-400 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 font-medium">Data e Hora</th>
                  <th className="px-4 py-2 font-medium">Disciplina</th>
                  <th className="px-4 py-2 font-medium">Professor</th>
                  <th className="px-4 py-2 font-medium">Duração</th>
                  <th className="px-4 py-2 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {aulas.map((aula) => {
                  const data = new Date(aula.data_hora);
                  const fim = new Date(data.getTime() + aula.duracao_minutos * 60000);
                  const formatterDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
                  const formatterTime = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' });
                  
                  return (
                  <tr key={aula.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">
                      {formatterDate.format(data)} <span className="text-gray-400 font-normal ml-1">• {formatterTime.format(data)} às {formatterTime.format(fim)}</span>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">{aula.disciplina?.nome || "-"}</td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">{aula.professor?.nome || "-"}</td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">{aula.duracao_minutos} min</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="relative">
                        <DeleteAulaButton id={aula.id} />
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800 flex justify-end bg-gray-50/30 dark:bg-slate-800/20">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-camini-cyan/10 text-camini-cobalt dark:text-camini-cyan border border-camini-cyan/20">
            Total: {aulas.length} {aulas.length === 1 ? "aula" : "aulas"}
          </span>
        </div>
      </div>
    </div>
  );
}
