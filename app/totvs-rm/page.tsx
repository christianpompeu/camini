"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Database,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { ChatSession, ChatMessage, UserSettings } from "@/lib/totvs-rm/types";
import { ChatSidebar } from "@/components/totvs-rm/chat-sidebar";
import { ChatMessages } from "@/components/totvs-rm/chat-messages";
import { TableInspectorModal } from "@/components/totvs-rm/table-inspector-modal";
import { SettingsModal } from "@/components/totvs-rm/settings-modal";
import { Button } from "@/components/ui/button";

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
    llmProvider: "gemini",
    geminiApiKey: "",
    geminiModel: "gemini-1.5-pro-latest",
    groqApiKey: "",
    groqModel: "llama3-70b-8192",
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
        const parsed = JSON.parse(savedSettings);
        const cleanGemini = parsed.geminiModel && parsed.geminiModel !== "gemini-2.5-flash" && parsed.geminiModel !== "gemini-1.5-flash" 
          ? parsed.geminiModel 
          : "gemini-1.5-pro-latest";
        const cleanGroq = parsed.groqModel && parsed.groqModel !== "llama-3.3-70b-versatile" 
          ? parsed.groqModel 
          : "llama3-70b-8192";

        // Trava temporária: somente SQL Server
        // eslint-disable-next-line
        setSettings({
          llmProvider: "gemini",
          groqApiKey: "",
          ...parsed,
          geminiModel: cleanGemini,
          groqModel: cleanGroq,
          sqlDialect: "sqlserver",
        });
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

      const defaultSession: ChatSession = {
        id: "session_" + Date.now(),
        title: "Nova Consulta SQL",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        dialect: "sqlserver",
      };
      setSessions([defaultSession]);
      setActiveSessionId(defaultSession.id);
    } catch (err) {
      console.error("Erro ao carregar dados do LocalStorage:", err);
      const fallbackSession: ChatSession = {
        id: "session_" + Date.now(),
        title: "Nova Consulta SQL",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        dialect: "sqlserver",
      };
      setSessions([fallbackSession]);
      setActiveSessionId(fallbackSession.id);
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
    const cleanGemini = newSettings.geminiModel && newSettings.geminiModel !== "gemini-2.5-flash" && newSettings.geminiModel !== "gemini-1.5-flash" 
      ? newSettings.geminiModel 
      : "gemini-1.5-pro-latest";
    const cleanGroq = newSettings.groqModel && newSettings.groqModel !== "llama-3.3-70b-versatile" 
      ? newSettings.groqModel 
      : "llama3-70b-8192";

    const normalized: UserSettings = {
      ...newSettings,
      llmProvider: newSettings.llmProvider || "gemini",
      geminiModel: cleanGemini,
      groqModel: cleanGroq,
      sqlDialect: "sqlserver",
    };
    setSettings(normalized);
    try {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS, JSON.stringify(normalized));
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
    }
  };

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

  const handleRenameSession = (id: string, newTitle: string) => {
    const updated = sessions.map((s) =>
      s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s
    );
    persistSessions(updated);
  };

  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = currentSession ? currentSession.messages : [];

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
          provider: settings.llmProvider,
          userApiKey: settings.geminiApiKey,
          userModel: settings.geminiModel,
          userGroqKey: settings.groqApiKey,
          userGroqModel: settings.groqModel,
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
    <div className="h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden font-sans">
      <div className="shrink-0">
        <Navbar />
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
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

        <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-background relative overflow-hidden">
          <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-muted/30 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title={isSidebarOpen ? "Recolher histórico" : "Expandir histórico"}
                className="h-8 w-8 hidden md:flex"
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </Button>

              <div className="h-4 w-px bg-border mx-1 hidden md:block" />

              <span className="font-semibold text-sm truncate">
                {currentSession?.title || "Nova Consulta"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 hidden sm:flex gap-2"
                onClick={() => {
                  setSelectedTableForInspector(undefined);
                  setInspectorOpen(true);
                }}
              >
                <Database className="h-3.5 w-3.5" />
                Dicionário RM
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSettingsOpen(true)}
                title="Configurações de IA"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            onInspectTable={openTableInspector}
            onSelectPromptSuggestion={(prompt) => {
              setInputPrompt(prompt);
              textareaRef.current?.focus();
            }}
          />

          <div className="p-4 border-t border-border bg-background shrink-0">
            <div className="max-w-4xl mx-auto space-y-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
                <span className="font-semibold text-muted-foreground mr-1 shrink-0">
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
                    className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors border text-xs font-medium ${
                      selectedModule === mod.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {mod.label}
                  </button>
                ))}
              </div>

              <div className="relative rounded-xl border border-input bg-background p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={inputPrompt}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Descreva a consulta SQL desejada..."
                  rows={1}
                  className="flex-1 min-w-0 resize-none bg-transparent py-2 px-2 text-sm placeholder:text-muted-foreground focus:outline-none max-h-32 leading-relaxed"
                />

                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim() || isLoading}
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span className="hidden sm:inline">Pressione <strong>Enter</strong> para enviar, <strong>Shift + Enter</strong> para nova linha</span>
                <span className="hidden sm:inline">TOTVS Corpore RM v12+</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      <TableInspectorModal
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        initialTable={selectedTableForInspector}
        onSelectTable={(tableName) => {
          setInputPrompt((prev) => (prev ? `${prev} tabela ${tableName}` : `Consultar tabela ${tableName} `));
          textareaRef.current?.focus();
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
