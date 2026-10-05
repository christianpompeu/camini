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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      {!isOpen && (
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleOpen}
          className="fixed left-4 top-20 z-30 md:hidden h-10 w-10 rounded-full shadow-md"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 h-full min-h-0 bg-background border-r border-border flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:hidden"
        }`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0 h-14">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-sm block leading-none">
                RM SQL AI
              </span>
              <span className="text-xs text-muted-foreground">Assistente TOTVS</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggleOpen} className="h-8 w-8 md:hidden">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 border-b border-border shrink-0">
          <Button onClick={onNewSession} className="w-full justify-start gap-2 h-9">
            <Plus className="h-4 w-4" />
            Nova Consulta SQL
          </Button>

          {sessions.length > 3 && (
            <div className="relative mt-3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar consultas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {sessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-20" />
              Nenhuma consulta salva.
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              Nenhum resultado.
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = editingId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-md text-xs cursor-pointer transition-colors ${
                    isActive
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-foreground" : ""}`} />
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="w-full px-1 py-0.5 rounded border border-ring bg-background focus:outline-none"
                      />
                    ) : (
                      <span className="truncate">{session.title}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    {isEditing ? (
                      <>
                        <button onClick={(e) => saveRename(session.id, e)} className="p-1 hover:text-foreground">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={cancelRename} className="p-1 hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => startRename(session, e)} className="p-1 hover:text-foreground">
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="p-1 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-border space-y-2 shrink-0">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-9 text-xs"
            onClick={onOpenInspector}
          >
            <Database className="h-4 w-4" />
            Dicionário RM
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 text-xs text-muted-foreground"
            onClick={onOpenSettings}
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
        </div>
      </aside>
    </>
  );
}
