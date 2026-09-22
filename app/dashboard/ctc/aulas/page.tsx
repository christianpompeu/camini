import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { getAulas, getDisciplinas, getProfessores, createAula, deleteAula } from "../actions";

export default async function AulasPage() {
  const aulas = await getAulas();
  const disciplinas = await getDisciplinas();
  const professores = await getProfessores();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Aulas</h1>
          <p className="text-gray-500">Programação de aulas e alocação de professores</p>
        </div>
      </div>

      {/* Formulário Simples de Inserção */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Agendar Aula</h2>
        <form action={async (formData) => { "use server"; await createAula(formData); }} className="flex gap-4 items-end flex-wrap">
          <div className="space-y-1 flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Disciplina</label>
            <select name="disciplina_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option value="">Selecione...</option>
              {disciplinas.map(d => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1 flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Professor</label>
            <select name="professor_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option value="">Selecione...</option>
              {professores.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1 flex-1 min-w-[180px]">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Data e Hora</label>
            <Input name="data_hora" type="datetime-local" required />
          </div>
          <div className="space-y-1 w-28">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Duração (m)</label>
            <Input name="duracao_minutos" type="number" defaultValue="60" min="1" />
          </div>
          <Button type="submit" className="bg-[#00c896] hover:bg-[#00b084] text-white h-10 px-6">
            <Plus className="w-4 h-4 mr-2" />
            Agendar
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {aulas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhuma aula agendada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Data e Hora</th>
                  <th className="px-6 py-3 font-medium">Disciplina</th>
                  <th className="px-6 py-3 font-medium">Professor</th>
                  <th className="px-6 py-3 font-medium">Duração</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {aulas.map((aula) => (
                  <tr key={aula.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {new Date(aula.data_hora).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{aula.disciplina?.nome || "-"}</td>
                    <td className="px-6 py-4 text-gray-500">{aula.professor?.nome || "-"}</td>
                    <td className="px-6 py-4 text-gray-500">{aula.duracao_minutos} min</td>
                    <td className="px-6 py-4 text-right">
                      <form action={async () => {
                        "use server";
                        await deleteAula(aula.id);
                      }}>
                        <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-700 hover:bg-red-50">
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
