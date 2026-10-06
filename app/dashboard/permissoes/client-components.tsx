"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Key, Users, Plus, X } from "lucide-react";
import { addPermission, removeSuperAdmin, removeRoute, deleteUserPermission, type AppPermission } from "./actions";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type PermissoesClientProps = {
  superAdmins: AppPermission[];
  appRoutes: {
    id: string;
    name: string;
    path: string;
    users: AppPermission[];
  }[];
};

export function PermissoesClient({ superAdmins, appRoutes }: PermissoesClientProps) {
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newRouteEmails, setNewRouteEmails] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    setIsSubmitting(true);
    
    const result = await addPermission(newAdminEmail, true);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Super admin adicionado com sucesso.");
      setNewAdminEmail("");
    }
    setIsSubmitting(false);
  };

  const handleRemoveSuperAdmin = async (id: string) => {
    setIsSubmitting(true);
    const result = await removeSuperAdmin(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Permissão de super admin removida.");
    }
    setIsSubmitting(false);
  };

  const handleAddRouteAccess = async (routeId: string) => {
    const email = newRouteEmails[routeId];
    if (!email) return;
    
    setIsSubmitting(true);
    const result = await addPermission(email, false, routeId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Acesso à rota concedido.");
      setNewRouteEmails(prev => ({ ...prev, [routeId]: "" }));
    }
    setIsSubmitting(false);
  };

  const handleRemoveRouteAccess = async (userId: string, routeId: string) => {
    setIsSubmitting(true);
    const result = await removeRoute(userId, routeId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Acesso à rota removido.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Coluna Esquerda - Super Admins */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="shadow-xs">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
              <Key className="h-4 w-4 text-primary" />
              Super Admins
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Admins têm acesso irrestrito a todos os módulos e podem alterar esta tela.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <form onSubmit={handleAddSuperAdmin} className="flex gap-2">
              <Input
                placeholder="E-mail do colaborador"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="h-9 text-sm transition-shadow"
                disabled={isSubmitting}
                type="email"
                required
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-9 w-9 shrink-0 shadow-xs" 
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </form>

            <div className="space-y-2 mt-6">
              {superAdmins.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Nenhum super admin cadastrado.</p>
              ) : (
                superAdmins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-2 rounded-md border border-border bg-background hover:bg-muted/50 transition-colors">
                    <span className="text-sm font-medium text-foreground truncate mr-2 px-1">
                      {admin.email}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleRemoveSuperAdmin(admin.id)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coluna Direita - Rotas */}
      <div className="lg:col-span-7 space-y-5">
        {appRoutes.map((route) => (
          <Card key={route.id} className="shadow-xs">
            <CardHeader className="py-3.5 px-5 border-b border-border flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold text-foreground">
                  Rota: <span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded-md text-muted-foreground border border-border ml-1">{route.path}</span>
                </CardTitle>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor={`public-${route.id}`} className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground cursor-pointer">Acesso Público</Label>
                <Switch id={`public-${route.id}`} disabled className="data-[state=checked]:bg-primary scale-75 origin-right" />
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="flex gap-2">
                <Input
                  placeholder="E-mail do colaborador"
                  value={newRouteEmails[route.id] || ""}
                  onChange={(e) => setNewRouteEmails({ ...newRouteEmails, [route.id]: e.target.value })}
                  className="h-9 text-sm transition-shadow"
                  disabled={isSubmitting}
                  type="email"
                />
                <Button 
                  type="button" 
                  onClick={() => handleAddRouteAccess(route.id)}
                  size="icon" 
                  className="h-9 w-9 shrink-0 shadow-xs" 
                  disabled={isSubmitting || !newRouteEmails[route.id]}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[30px] items-center">
                {route.users.map((user) => (
                  <Badge 
                    key={user.id} 
                    variant="secondary" 
                    className="flex items-center gap-1.5 py-1 px-3 border border-border/50 font-normal shadow-none"
                  >
                    <span className="text-xs">{user.email}</span>
                    <button 
                      onClick={() => handleRemoveRouteAccess(user.id, route.id)}
                      className="text-muted-foreground hover:text-foreground focus:outline-none transition-colors ml-0.5"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {route.users.length === 0 && (
                  <p className="text-xs text-muted-foreground w-full text-left pl-1">Nenhuma permissão específica. (Super Admins já possuem acesso).</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
