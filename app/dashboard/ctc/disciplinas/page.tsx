import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DisciplinasPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Disciplinas</h1>
          <p className="text-gray-500">Grade curricular do CTC</p>
        </div>
        <Button className="bg-[#00c896] hover:bg-[#00b084] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Disciplina
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          Nenhuma disciplina cadastrada ainda.
        </div>
      </div>
    </div>
  );
}
