import React from "react";
import { Card } from "@/components/ui/card";
import { Users, BookOpen, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTCPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gestão CTC</h1>
          <p className="text-gray-500">Visão geral do Curso de Teologia Cristã</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 flex flex-col justify-between bg-white">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500">Professores</h3>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <p className="text-xs text-gray-500 mt-1">Professores cadastrados</p>
            <div className="mt-4">
              <Link href="/dashboard/ctc/professores">
                <Button className="w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm">Gerenciar</Button>
              </Link>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 flex flex-col justify-between bg-white">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500">Disciplinas</h3>
            <BookOpen className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">24</div>
            <p className="text-xs text-gray-500 mt-1">Disciplinas na grade</p>
            <div className="mt-4">
              <Link href="/dashboard/ctc/disciplinas">
                <Button className="w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm">Gerenciar</Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between bg-white">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500">Aulas Programadas</h3>
            <CalendarDays className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">8</div>
            <p className="text-xs text-gray-500 mt-1">Para os próximos 30 dias</p>
            <div className="mt-4">
              <Link href="/dashboard/ctc/aulas">
                <Button className="w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm">Gerenciar</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
