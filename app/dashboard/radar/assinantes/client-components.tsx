"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Plus, Users, Search, Power } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { addAssinante, toggleStatusAssinante, deleteAssinante, type Assinante } from "./actions";

export function AssinantesClient({ assinantes }: { assinantes: Assinante[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = assinantes.filter(
    (a) =>
      (a.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await addAssinante(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Assinante adicionado com sucesso.");
      setIsAddOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleToggle = async (id: string, current: string) => {
    const result = await toggleStatusAssinante(id, current);
    if (result.error) toast.error(result.error);
    else toast.success(current === "ativo" ? "Assinatura cancelada." : "Assinatura reativada.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este assinante?")) return;
    const result = await deleteAssinante(id);
    if (result.error) toast.error(result.error);
    else toast.success("Assinante excluído.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="h-9 gap-1.5 shadow-xs w-full sm:w-auto" />}>
            <Plus className="h-4 w-4" />
            Adicionar Assinante
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Assinante</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input id="nome" name="nome" placeholder="Ex: João Silva" required disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" placeholder="Ex: joao@email.com" required disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone (Opcional)</Label>
                <Input id="telefone" name="telefone" placeholder="Ex: (11) 99999-9999" disabled={isSubmitting} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select id="status" name="status" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="ativo">Ativo</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origem">Origem</Label>
                  <select id="origem" name="origem" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="manual">Manual</option>
                    <option value="site">Site</option>
                    <option value="app_forca">App FORÇA</option>
                  </select>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Assinante</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Origem</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="h-8 w-8 opacity-20" />
                      <p>Nenhum assinante encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{a.nome}</div>
                      <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("pt-BR")}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground">{a.email}</div>
                      {a.telefone && <div className="text-xs text-muted-foreground">{a.telefone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={a.status === "ativo" ? "default" : "secondary"} className={a.status === "ativo" ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20" : ""}>
                        {a.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs capitalize text-muted-foreground">
                        {a.origem?.replace("_", " ") || "Desconhecido"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${a.status === 'ativo' ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`}
                          onClick={() => handleToggle(a.id, a.status)}
                          title={a.status === 'ativo' ? 'Cancelar Assinatura' : 'Reativar Assinatura'}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(a.id)}
                          title="Excluir Permanentemente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
