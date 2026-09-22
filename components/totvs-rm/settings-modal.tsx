"use client";

import React, { useState, useEffect } from "react";
import { X, Key, Cpu, Database, Check, ExternalLink, ShieldCheck } from "lucide-react";
import { UserSettings } from "@/lib/totvs-rm/types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const cleanGemini = (m?: string) => (m && m !== "gemini-2.5-flash" && m !== "gemini-1.5-flash" ? m : "gemini-1.5-pro-latest");
  const cleanGroq = (m?: string) => (m && m !== "llama-3.3-70b-versatile" ? m : "llama3-70b-8192");

  const [apiKey, setApiKey] = useState(settings.geminiApiKey || "");
  const [model, setModel] = useState(cleanGemini(settings.geminiModel));
  const [provider, setProvider] = useState<"gemini" | "groq" | "openrouter">(settings.llmProvider || "gemini");
  const [groqKey, setGroqKey] = useState(settings.groqApiKey || "");
  const [groqModel, setGroqModel] = useState(cleanGroq(settings.groqModel));
  const [dialect, setDialect] = useState<"sqlserver" | "oracle">(settings.sqlDialect || "sqlserver");
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApiKey(settings.geminiApiKey || "");
    setModel(cleanGemini(settings.geminiModel));
    setProvider(settings.llmProvider || "gemini");
    setGroqKey(settings.groqApiKey || "");
    setGroqModel(cleanGroq(settings.groqModel));
    setDialect(settings.sqlDialect || "sqlserver");
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...settings,
      llmProvider: provider === "openrouter" ? "gemini" : provider,
      geminiApiKey: apiKey.trim(),
      geminiModel: model,
      groqApiKey: groqKey.trim(),
      groqModel,
      // Trava temporária: somente SQL Server (Oracle em breve)
      sqlDialect: "sqlserver",
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl border border-outline glass-surface bg-surface-elevated/95 p-6 shadow-2xl space-y-6 text-text-primary"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-outline/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-energy-blue/15 text-energy-blue flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Configurações de IA & SQL</h2>
              <p className="text-xs text-text-secondary">Ajuste o modelo de inteligência e dialeto do RM</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provedor de IA */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-energy-violet" />
              Provedor de IA
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProvider("gemini")}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  provider === "gemini"
                    ? "border-energy-blue bg-energy-blue/15 text-energy-blue shadow-sm"
                    : "border-outline bg-surface text-text-secondary hover:text-text-primary"
                }`}
              >
                <span>Gemini</span>
                {provider === "gemini" && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setProvider("groq")}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  provider === "groq"
                    ? "border-energy-blue bg-energy-blue/15 text-energy-blue shadow-sm"
                    : "border-outline bg-surface text-text-secondary hover:text-text-primary"
                }`}
              >
                <span>Groq</span>
                {provider === "groq" && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                disabled
                title="OpenRouter em breve"
                className="relative flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold border-outline bg-surface text-text-secondary opacity-50 cursor-not-allowed"
              >
                <span>OpenRouter</span>
                <span className="text-[9px] uppercase font-extrabold tracking-widest px-1.5 py-0.5 rounded-pill bg-surface-elevated border border-outline text-text-secondary">
                  Em breve
                </span>
              </button>
            </div>
            <p className="text-[11px] text-text-secondary pt-0.5">
              Se o provedor principal falhar (limite/queda), o outro é tentado automaticamente.
            </p>
          </div>

          {provider === "groq" ? (
            <>
              {/* Chave de API Groq */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-energy-blue" />
                    Chave de API Groq
                  </span>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-energy-blue hover:underline inline-flex items-center gap-1"
                  >
                    <span>Obter chave grátis</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="Cole sua chave gsk_..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-energy-blue font-mono"
                />
                <p className="text-[11px] text-text-secondary flex items-center gap-1 pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-energy-green shrink-0" />
                  Sua chave é salva apenas no seu navegador (localStorage) e nunca é exposta publicamente.
                </p>
              </div>

              {/* Seleção do Modelo Groq */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-energy-violet" />
                  Modelo de Linguagem (Groq)
                </label>
                <select
                  value={groqModel}
                  onChange={(e) => setGroqModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-energy-blue"
                >
                  <option value="llama3-70b-8192">Llama 3 70B (llama3-70b-8192 - Recomendado)</option>
                  <option value="llama-3.1-70b-versatile">Llama 3.1 70B (Versatile)</option>
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B (Ultrarrápido, Alta Quota)</option>
                  <option value="qwen/qwen3-32b">Qwen3 32B (Raciocínio)</option>
                  <option value="openai/gpt-oss-120b">GPT-OSS 120B (Máxima Capacidade)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Chave de API Gemini */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-energy-blue" />
                    Chave de API Gemini (Google AI Studio)
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-energy-blue hover:underline inline-flex items-center gap-1"
                  >
                    <span>Obter chave grátis</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Cole sua chave AIzaSy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-energy-blue font-mono"
                />
                <p className="text-[11px] text-text-secondary flex items-center gap-1 pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-energy-green shrink-0" />
                  Sua chave é salva apenas no seu navegador (localStorage) e nunca é exposta publicamente.
                </p>
              </div>

              {/* Seleção do Modelo Gemini */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-energy-violet" />
                  Modelo de Linguagem (Gemini)
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-energy-blue"
                >
                  <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro Latest (Recomendado)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Estável)</option>
                </select>
              </div>
            </>
          )}

          {/* Dialeto SQL Padrão */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-energy-amber" />
              Banco de Dados do TOTVS Corpore RM
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDialect("sqlserver")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  dialect === "sqlserver"
                    ? "border-energy-blue bg-energy-blue/15 text-energy-blue shadow-sm"
                    : "border-outline bg-surface text-text-secondary hover:text-text-primary"
                }`}
              >
                <span>Microsoft SQL Server</span>
                {dialect === "sqlserver" && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                disabled
                title="Suporte a Oracle em breve — no momento geramos apenas SQL Server (T-SQL)"
                className="relative flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all border-outline bg-surface text-text-secondary opacity-50 cursor-not-allowed"
              >
                <span>Oracle PL/SQL</span>
                <span className="text-[9px] uppercase font-extrabold tracking-widest px-1.5 py-0.5 rounded-pill bg-surface-elevated border border-outline text-text-secondary">
                  Em breve
                </span>
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-energy text-white text-xs font-bold shadow-md shadow-energy-blue/20 hover:brightness-105 transition-all"
            >
              {savedNotice ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvo!</span>
                </>
              ) : (
                <span>Salvar Configurações</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
