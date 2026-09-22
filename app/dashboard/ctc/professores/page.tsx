import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ArrowLeft, Users, UserPlus } from "lucide-react";
import { getProfessores, createProfessor, deleteProfessor } from "../actions";

export default async function ProfessoresPage() {
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
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Professores</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-camini text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Professores</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Gerencie os professores do CTC</p>
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
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">Adicionar Professor</h2>
        </div>
        <form action={async (formData) => { "use server"; await createProfessor(formData); }} className="flex gap-4 items-end flex-wrap">
          <div className="space-y-1 flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Nome</label>
            <Input name="nome" placeholder="Nome do Professor" required />
          </div>
          <div className="space-y-1 flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Email</label>
            <Input name="email" type="email" placeholder="Email (opcional)" />
          </div>
          <div className="space-y-1 flex-1 min-w-[150px]">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Telefone</label>
            <Input name="telefone" placeholder="(11) 99999-9999" />
          </div>
          <Button variant="camini" type="submit" className="h-10 px-6">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-camini text-white flex items-center justify-center shadow-xs shrink-0">
              <Users className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
              Professores Cadastrados
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-camini-cyan/15 text-camini-cobalt dark:text-camini-cyan border border-camini-cyan/20">
            {professores.length} {professores.length === 1 ? "professor" : "professores"}
          </span>
        </div>
        {professores.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Nenhum professor cadastrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Telefone</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {professores.map((prof) => (
                  <tr key={prof.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{prof.nome}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{prof.email || "-"}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{prof.telefone || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <form action={async () => {
                        "use server";
                        await deleteProfessor(prof.id);
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
