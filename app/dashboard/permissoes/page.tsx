import React from "react";
import { ShieldCheck } from "lucide-react";
import { getPermissions } from "./actions";
import { PermissoesClient } from "./client-components";

export const metadata = {
  title: "Permissões — Camini",
  description: "Controle de permissões e acessos a módulos restritos do sistema.",
};

export default async function PermissoesPage() {
  const permissions = await getPermissions();

  const superAdmins = permissions.filter((p) => p.is_super_admin);
  const regularUsers = permissions.filter((p) => !p.is_super_admin);

  // Mapear rotas para visualizacao.
  const appRoutes = [
    {
      id: "/dashboard/radar",
      name: "Gestão do Radar Tributário",
      path: "/dashboard/radar",
      users: permissions.filter((p) => p.allowed_routes?.includes("/dashboard/radar")),
    },
    {
      id: "/dashboard/ctc",
      name: "Gestão do CTC",
      path: "/dashboard/ctc",
      users: permissions.filter((p) => p.allowed_routes?.includes("/dashboard/ctc")),
    },
    {
      id: "/dashboard/permissoes",
      name: "Controle de Permissões",
      path: "/dashboard/permissoes",
      users: permissions.filter((p) => p.allowed_routes?.includes("/dashboard/permissoes")),
    },
    {
      id: "/dashboard/ajustes",
      name: "Ajustes do Sistema",
      path: "/dashboard/ajustes",
      users: permissions.filter((p) => p.allowed_routes?.includes("/dashboard/ajustes")),
    },
    {
      id: "/totvs-rm",
      name: "RM SQL AI",
      path: "/totvs-rm",
      users: permissions.filter((p) => p.allowed_routes?.includes("/totvs-rm")),
    },
    {
      id: "/forca",
      name: "App FORÇA",
      path: "/forca",
      users: permissions.filter((p) => p.allowed_routes?.includes("/forca")),
    },
    {
      id: "/playground",
      name: "Design System",
      path: "/playground",
      users: permissions.filter((p) => p.allowed_routes?.includes("/playground")),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            Controle de Permissões
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie quem tem acesso aos menus restritos (App Router Architecture).
          </p>
        </div>
      </div>

      <PermissoesClient 
        superAdmins={superAdmins} 
        appRoutes={appRoutes} 
      />
    </div>
  );
}
