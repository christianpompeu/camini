"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Database,
  Settings,
  Menu,
  Plus,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { ChatSession, ChatMessage, UserSettings } from "@/lib/totvs-rm/types";
import { ChatSidebar } from "@/components/totvs-rm/chat-sidebar";
import { ChatMessages } from "@/components/totvs-rm/chat-messages";
import { TableInspectorModal } from "@/components/totvs-rm/table-inspector-modal";
import { SettingsModal } from "@/components/totvs-rm/settings-modal";

const LOCAL_STORAGE_SESSIONS = "camini_totvs_rm_sessions";
const LOCAL_STORAGE_SETTINGS = "camini_totvs_rm_settings";

export default function TotvsRmChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectedTableForInspector, setSelectedTableForInspector] = useState<string | undefined>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState("");

  const [settings, setSettings] = useState<UserSettings>({
    geminiApiKey: "",
    geminiModel: "gemini-2.5-flash",
    sqlDialect: "sqlserver",
    includeComments: true,
    defaultColigadaFilter: true,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Carregar sessões e configurações do LocalStorage na inicialização
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      const savedSessions = localStorage.getItem(LOCAL_STORAGE_SESSIONS);
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      }

      // Sessão inicial padrão caso não haja nenhuma
      createNewSession();
    } catch (err) {
      console.error("Erro ao carregar dados do LocalStorage:", err);
      createNewSession();
    }
  }, []);

  // 2. Salvar sessões no LocalStorage
  const persistSessions = (newSessions: ChatSession[]) => {
    setSessions(newSessions);
    try {
      localStorage.setItem(LOCAL_STORAGE_SESSIONS, JSON.stringify(newSessions));
    } catch (err) {
      console.error("Erro ao salvar sessões:", err);
    }
  };

  // 3. Salvar configurações
  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS, JSON.stringify(newSettings));
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
    }
  };

  // Criar nova sessão
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: "session_" + Date.now(),
      title: "Nova Consulta SQL",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      dialect: settings.sqlDialect,
    };
    persistSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
  };

  // Excluir sessão
  const handleDeleteSession = (id: string) => {
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      const fresh: ChatSession = {
        id: "session_" + Date.now(),
        title: "Nova Consulta SQL",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        dialect: settings.sqlDialect,
      };
      persistSessions([fresh]);
      setActiveSessionId(fresh.id);
    } else {
      persistSessions(remaining);
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  // Renomear sessão
  const handleRenameSession = (id: string, newTitle: string) => {
    const updated = sessions.map((s) =>
      s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s
    );
    persistSessions(updated);
  };

  // Sessão atual ativa
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = currentSession ? currentSession.messages : [];

  // Enviar mensagem para a API
  const handleSendMessage = async (promptToSend?: string) => {
    const text = (promptToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    setInputPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const userMessage: ChatMessage = {
      id: "msg_" + Date.now(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    // Atualiza título da conversa se for a primeira mensagem
    const shouldUpdateTitle = messages.length === 0;
    const generatedTitle = shouldUpdateTitle
      ? text.slice(0, 32) + (text.length > 32 ? "..." : "")
      : currentSession.title;

    const updatedMessages = [...messages, userMessage];

    const updatedSession: ChatSession = {
      ...currentSession,
      title: generatedTitle,
      updatedAt: Date.now(),
      messages: updatedMessages,
    };

    const newSessions = sessions.map((s) =>
      s.id === currentSession.id ? updatedSession : s
    );
    persistSessions(newSessions);

    setIsLoading(true);

    try {
      const response = await fetch("/api/totvs-rm/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          systemModule: selectedModule,
          dialect: settings.sqlDialect,
          userApiKey: settings.geminiApiKey,
          userModel: settings.geminiModel,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao comunicar com o gerador de consultas.");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: "msg_bot_" + Date.now(),
        role: "assistant",
        content: data.content || data.sqlExplanation || "Consulta gerada com sucesso.",
        sqlCode: data.sqlCode,
        sqlExplanation: data.sqlExplanation,
        tablesUsed: data.tablesUsed || [],
        tips: data.tips || [],
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      const finalSession: ChatSession = {
        ...updatedSession,
        messages: finalMessages,
        updatedAt: Date.now(),
      };

      persistSessions(
        sessions.map((s) => (s.id === currentSession.id ? finalSession : s))
      );
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      const errorMessage: ChatMessage = {
        id: "msg_err_" + Date.now(),
        role: "assistant",
        content: "Houve um problema ao processar sua consulta. Verifique sua chave de API ou tente novamente.",
        timestamp: Date.now(),
      };
      persistSessions(
        sessions.map((s) =>
          s.id === currentSession.id
            ? { ...updatedSession, messages: [...updatedMessages, errorMessage] }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Ajuste de altura do textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputPrompt(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + "px";
  };

  const openTableInspector = (tableName: string) => {
    setSelectedTableForInspector(tableName);
    setInspectorOpen(true);
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-surface text-text-primary overflow-hidden">
      {/* Barra de Navegação Mestre camini */}
      <div className="shrink-0">
        <Navbar />
      </div>

      {/* Conteúdo Principal do Módulo RM SQL */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Barra Lateral de Conversas */}
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onNewSession={createNewSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onOpenInspector={() => {
            setSelectedTableForInspector(undefined);
            setInspectorOpen(true);
          }}
          onOpenSettings={() => setSettingsOpen(true)}
          isOpen={isSidebarOpen}
          onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Área Central de Conversa */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-surface relative overflow-hidden">
          {/* Barra Superior de Contexto do Chat */}
          <div className="h-11 border-b border-outline px-4 flex items-center justify-between bg-surface-elevated/40 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                title={isSidebarOpen ? "Recolher histórico" : "Expandir histórico"}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeft className="w-4 h-4" />
                )}
              </button>

              <div className="h-4 w-px bg-outline mx-1" />

              <span className="font-bold text-xs text-text-primary truncate">
                {currentSession?.title || "Nova Consulta"}
              </span>

              <span className="text-[10px] px-2 py-0.5 rounded-pill bg-surface border border-outline text-text-secondary hidden sm:inline-block font-mono">
                {settings.sqlDialect === "oracle" ? "Oracle PL/SQL" : "SQL Server T-SQL"}
              </span>
            </div>

            {/* Ações Rápidas no Topo */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setSelectedTableForInspector(undefined);
                  setInspectorOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-outline transition-colors"
                title="Explorar dicionário de dados RM"
              >
                <Database className="w-3.5 h-3.5 text-energy-blue" />
                <span className="hidden sm:inline">Dicionário RM</span>
              </button>

              <button
                onClick={() => setSettingsOpen(true)}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                title="Configurações de IA"
              >
                <Settings className="w-4 h-4 text-energy-violet" />
              </button>
            </div>
          </div>

          {/* Lista de Mensagens */}
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            onInspectTable={openTableInspector}
            onSelectPromptSuggestion={(prompt) => handleSendMessage(prompt)}
          />

          {/* Área de Entrada de Prompt */}
          <div className="p-2 sm:p-3 border-t border-outline/70 bg-surface/90 backdrop-blur-md shrink-0">
            <div className="max-w-4xl mx-auto space-y-1.5">
              {/* Filtro Rápido por Módulo RM */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[10px] sm:text-[11px] scrollbar-none">
                <span className="text-text-secondary text-[10px] uppercase font-bold mr-0.5 shrink-0">
                  Foco:
                </span>
                {[
                  { label: "Automático (RAG Geral)", value: "" },
                  { label: "Fluxus (Financeiro)", value: "FLUXUS" },
                  { label: "Nucleus (Compras/Estoque)", value: "NUCLEUS" },
                  { label: "Labore (Folha/RH)", value: "LABORE" },
                  { label: "Saldus (Contábil)", value: "SALDUS" },
                ].map((mod) => (
                  <button
                    key={mod.value}
                    onClick={() => setSelectedModule(mod.value)}
                    className={`px-2 py-0.5 rounded-pill whitespace-nowrap transition-colors font-medium border ${
                      selectedModule === mod.value
                        ? "bg-energy-blue text-white border-energy-blue"
                        : "bg-surface-elevated text-text-secondary border-outline hover:text-text-primary"
                    }`}
                  >
                    {mod.label}
                  </button>
                ))}
              </div>

              {/* Caixa de Texto do Chat */}
              <div className="relative rounded-2xl border border-outline bg-surface-elevated p-1.5 sm:p-2 shadow-lg focus-within:border-energy-blue/60 transition-all flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={inputPrompt}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ex: Consultar lançamentos..."
                  rows={1}
                  className="flex-1 min-w-0 resize-none bg-transparent py-1.5 px-2 text-xs sm:text-sm text-text-primary placeholder:text-text-secondary focus:outline-none max-h-32 font-sans leading-relaxed"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim() || isLoading}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-energy flex items-center justify-center text-white shadow-md shadow-energy-blue/20 hover:brightness-105 disabled:opacity-40 disabled:hover:brightness-100 transition-all shrink-0"
                  aria-label="Enviar solicitação"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-text-secondary px-1">
                <span className="hidden sm:inline">Pressione <strong>Enter</strong> para enviar, <strong>Shift + Enter</strong> para nova linha</span>
                <span className="hidden sm:inline">TOTVS Corpore RM v12+ • Dicionário Local</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modais de Suporte */}
      <TableInspectorModal
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        initialTable={selectedTableForInspector}
        onSelectTable={(tableName) => {
          setInputPrompt((prev) => (prev ? `${prev} tabela ${tableName}` : `Consultar tabela ${tableName} `));
        }}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
