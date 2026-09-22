import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { getDisciplinas, createDisciplina, deleteDisciplina } from "../actions";

export default async function DisciplinasPage() {
  const disciplinas = await getDisciplinas();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Disciplinas</h1>
          <p className="text-gray-500">Grade curricular do CTC</p>
        </div>
      </div>

      {/* Formulário Simples de Inserção */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Adicionar Disciplina</h2>
        <form action={async (formData) => { "use server"; await createDisciplina(formData); }} className="flex gap-4 items-end flex-wrap">
          <div className="space-y-1 flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome</label>
            <Input name="nome" placeholder="Nome da Disciplina" required />
          </div>
          <div className="space-y-1 flex-1 min-w-[250px]">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Descrição</label>
            <Input name="descricao" placeholder="Breve descrição" />
          </div>
          <div className="space-y-1 w-32">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Carga (h)</label>
            <Input name="carga_horaria" type="number" placeholder="40" min="1" />
          </div>
          <Button type="submit" className="bg-[#00c896] hover:bg-[#00b084] text-white h-10 px-6">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {disciplinas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhuma disciplina cadastrada ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Descrição</th>
                  <th className="px-6 py-3 font-medium">Carga Horária</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {disciplinas.map((disc) => (
                  <tr key={disc.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{disc.nome}</td>
                    <td className="px-6 py-4 text-gray-500">{disc.descricao || "-"}</td>
                    <td className="px-6 py-4 text-gray-500">{disc.carga_horaria ? `${disc.carga_horaria}h` : "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <form action={async () => {
                        "use server";
                        await deleteDisciplina(disc.id);
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
