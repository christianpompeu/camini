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
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || "");
  const [model, setModel] = useState(settings.geminiModel || "gemini-2.5-flash");
  const [dialect, setDialect] = useState<"sqlserver" | "oracle">(settings.sqlDialect || "sqlserver");
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setApiKey(settings.geminiApiKey || "");
    setModel(settings.geminiModel || "gemini-2.5-flash");
    setDialect(settings.sqlDialect || "sqlserver");
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...settings,
      geminiApiKey: apiKey.trim(),
      geminiModel: model,
      sqlDialect: dialect,
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
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultrarrápido, Recomendado)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Leve & Estável)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Raciocínio Complexo)</option>
            </select>
          </div>

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
                onClick={() => setDialect("oracle")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  dialect === "oracle"
                    ? "border-energy-blue bg-energy-blue/15 text-energy-blue shadow-sm"
                    : "border-outline bg-surface text-text-secondary hover:text-text-primary"
                }`}
              >
                <span>Oracle PL/SQL</span>
                {dialect === "oracle" && <Check className="w-3.5 h-3.5" />}
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
