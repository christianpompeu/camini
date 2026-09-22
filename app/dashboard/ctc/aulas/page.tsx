import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ArrowLeft, CalendarDays, CalendarPlus } from "lucide-react";
import { getAulas, getDisciplinas, getProfessores, createAula, deleteAula } from "../actions";

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

        <Link href="/dashboard/ctc">
          <Button
            variant="camini"
            size="sm"
            className="gap-2 shadow-md hover:shadow-lg transition-all rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao CTC
          </Button>
        </Link>
      </div>

      {/* Formulário de Cadastro */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-camini text-white flex items-center justify-center shadow-sm shrink-0">
            <CalendarPlus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">Agendar Aula</h2>
        </div>
        <form action={async (formData) => { "use server"; await createAula(formData); }} className="flex gap-4 items-end flex-wrap">
          <div className="space-y-1 flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Disciplina</label>
            <select name="disciplina_id" required className="flex h-10 w-full rounded-md border border-outline bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-energy-blue">
              <option value="">Selecione...</option>
              {disciplinas.map(d => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1 flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Professor</label>
            <select name="professor_id" required className="flex h-10 w-full rounded-md border border-outline bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-energy-blue">
              <option value="">Selecione...</option>
              {professores.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1 flex-1 min-w-[180px]">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Data e Hora</label>
            <Input name="data_hora" type="datetime-local" required />
          </div>
          <div className="space-y-1 w-28">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Duração (m)</label>
            <Input name="duracao_minutos" type="number" defaultValue="60" min="1" />
          </div>
          <Button variant="camini" type="submit" className="h-10 px-6">
            <Plus className="w-4 h-4 mr-2" />
            Agendar
          </Button>
        </form>
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
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-camini-cyan/15 text-camini-cobalt dark:text-camini-cyan border border-camini-cyan/20">
            {aulas.length} {aulas.length === 1 ? "aula" : "aulas"}
          </span>
        </div>
        {aulas.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Nenhuma aula agendada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Data e Hora</th>
                  <th className="px-6 py-3 font-medium">Disciplina</th>
                  <th className="px-6 py-3 font-medium">Professor</th>
                  <th className="px-6 py-3 font-medium">Duração</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {aulas.map((aula) => (
                  <tr key={aula.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {new Date(aula.data_hora).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{aula.disciplina?.nome || "-"}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{aula.professor?.nome || "-"}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{aula.duracao_minutos} min</td>
                    <td className="px-6 py-4 text-right">
                      <form action={async () => {
                        "use server";
                        await deleteAula(aula.id);
                      }}>
                        <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
