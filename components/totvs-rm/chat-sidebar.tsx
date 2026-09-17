"use client";

import React, { useState } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Database,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  Bot,
} from "lucide-react";
import { ChatSession } from "@/lib/totvs-rm/types";

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onOpenInspector: () => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onOpenInspector,
  onOpenSettings,
  isOpen,
  onToggleOpen,
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Botão de abrir/fechar em telas menores ou recolhido */}
      {!isOpen && (
        <button
          onClick={onToggleOpen}
          aria-label="Abrir histórico de conversas"
          className="fixed left-3 top-20 z-30 p-2.5 rounded-xl bg-surface-elevated border border-outline text-text-primary shadow-lg hover:border-energy-blue transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Barra Lateral Flutuante / Fixa */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 sm:w-80 h-full min-h-0 overflow-hidden glass-surface bg-surface-elevated/95 md:bg-surface/50 border-r border-outline flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full md:hidden"
        }`}
      >
        {/* Cabeçalho da Sidebar */}
        <div className="p-4 border-b border-outline/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-energy flex items-center justify-center text-white font-bold shadow-md shadow-energy-blue/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-text-primary block leading-tight">
                RM SQL Studio
              </span>
              <span className="text-[10px] text-text-secondary">Histórico de Consultas</span>
            </div>
          </div>

          <button
            onClick={onToggleOpen}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            title="Recolher barra lateral"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Botão Nova Consulta */}
        <div className="p-3 border-b border-outline/60 shrink-0">
          <button
            onClick={onNewSession}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-energy text-white text-xs font-bold shadow-md shadow-energy-blue/20 hover:brightness-105 transition-all tap-effect"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Consulta SQL</span>
          </button>

          {/* Busca no histórico */}
          {sessions.length > 3 && (
            <div className="relative mt-2.5">
              <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar conversas..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-outline bg-surface text-text-primary text-[11px] focus:outline-none focus:ring-1 focus:ring-energy-blue"
              />
            </div>
          )}
        </div>

        {/* Lista de Sessões / Histórico */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {sessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-text-secondary space-y-1">
              <MessageSquare className="w-6 h-6 mx-auto text-text-secondary/40 mb-2" />
              <p>Nenhuma conversa salva.</p>
              <p className="text-[11px] opacity-70">Inicie uma nova consulta acima.</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-text-secondary">
              Nenhuma consulta encontrada com esse termo.
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = editingId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isActive
                      ? "border-energy-blue/50 bg-surface-elevated text-text-primary font-semibold shadow-sm"
                      : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface/80"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-energy-blue" : "opacity-60"}`} />
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="w-full px-2 py-0.5 rounded border border-energy-blue bg-surface text-xs focus:outline-none"
                      />
                    ) : (
                      <span className="truncate block text-xs">{session.title}</span>
                    )}
                  </div>

                  {/* Ações de Edição e Exclusão */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                    {isEditing ? (
                      <>
                        <button
                          onClick={(e) => saveRename(session.id, e)}
                          className="p-1 text-energy-green hover:bg-surface rounded"
                          title="Salvar título"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelRename}
                          className="p-1 text-text-secondary hover:bg-surface rounded"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => startRename(session, e)}
                          className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface rounded"
                          title="Renomear"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="p-1 text-text-secondary hover:text-energy-coral hover:bg-surface rounded"
                          title="Excluir conversa"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé da Sidebar: Dicionário & Configurações */}
        <div className="p-3 border-t border-outline/60 space-y-1.5 bg-surface/30 shrink-0">
          <button
            onClick={onOpenInspector}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors border border-transparent hover:border-outline"
          >
            <Database className="w-4 h-4 text-energy-blue" />
            <span>Explorar Dicionário RM</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors border border-transparent hover:border-outline"
          >
            <Settings className="w-4 h-4 text-energy-violet" />
            <span>Configurações de IA & Banco</span>
          </button>
        </div>
      </aside>
    </>
  );
}
