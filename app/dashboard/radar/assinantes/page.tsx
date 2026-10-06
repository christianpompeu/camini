import React from "react";
import Link from "next/link";
import { getAssinantes } from "./actions";
import { AssinantesClient } from "./client-components";

export const metadata = {
  title: "Assinantes do Radar — Camini",
  description: "Gestão de assinantes da newsletter Radar da Reforma Tributária.",
};

export default async function AssinantesPage() {
  const assinantes = await getAssinantes();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link 
              href="/dashboard/radar" 
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Gestão Radar
            </Link>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-medium text-foreground">Assinantes</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Assinantes da Newsletter
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestão da base de contatos, status de assinatura e inscrições.
          </p>
        </div>
      </div>

      <AssinantesClient assinantes={assinantes} />
    </div>
  );
}
