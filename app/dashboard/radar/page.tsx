import React from "react";
import { Radio, Users, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getAdminRadarEditions, getFilaAcoes } from "./actions";
import { getAssinantes } from "./assinantes/actions";
import { FilaRadarClient } from "./client-components";

export const metadata = {
  title: "Gestão Radar — Camini",
  description: "Administração editorial e de assinantes do Radar da Reforma Tributária.",
};

export default async function RadarDashboardPage() {
  const [edicoes, filaAcoes, assinantes] = await Promise.all([
    getAdminRadarEditions(),
    getFilaAcoes(),
    getAssinantes()
  ]);

  const stats = {
    assinantes_ativos: assinantes.filter((a) => a.status === "ativo").length,
    acoes_pendentes: filaAcoes.filter((a) => a.status === "pendente").length,
    edicoes_processadas: filaAcoes.filter((a) => a.status === "processado").length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Radio className="h-6 w-6 text-blue-600" />
            Gestão Radar Tributário
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Administração de fila editorial e base de assinantes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Assinantes */}
        <Link href="/dashboard/radar/assinantes" className="group">
          <Card className="hover:border-primary/50 transition-colors shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Assinantes Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {stats.assinantes_ativos}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Leitores da newsletter
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Fila de Ações - Pendentes */}
        <Card className="shadow-xs bg-muted/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ações na Fila (Pendentes)
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {stats.acoes_pendentes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Edições aguardando Worker
            </p>
          </CardContent>
        </Card>

        {/* Fila de Ações - Processadas */}
        <Card className="shadow-xs bg-muted/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ações Processadas (Work)
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {stats.edicoes_processadas}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sincronizadas com sucesso
            </p>
          </CardContent>
        </Card>
      </div>

      <FilaRadarClient edicoes={edicoes} filaAcoes={filaAcoes} />
    </div>
  );
}
