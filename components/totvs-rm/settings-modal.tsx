"use client";

import React, { useState, useEffect } from "react";
import { Key, Cpu, Database, Check, ExternalLink, ShieldCheck } from "lucide-react";
import { UserSettings } from "@/lib/totvs-rm/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [provider, setProvider] = useState<"gemini" | "groq" | "openrouter" | "openai">(settings.llmProvider || "gemini");
  const [groqKey, setGroqKey] = useState(settings.groqApiKey || "");
  const [groqModel, setGroqModel] = useState(cleanGroq(settings.groqModel));
  const [dialect, setDialect] = useState<"sqlserver" | "oracle">(settings.sqlDialect || "sqlserver");
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setApiKey(settings.geminiApiKey || "");
    setModel(cleanGemini(settings.geminiModel));
    setProvider(settings.llmProvider || "gemini");
    setGroqKey(settings.groqApiKey || "");
    setGroqModel(cleanGroq(settings.groqModel));
    setDialect(settings.sqlDialect || "sqlserver");
  }, [settings, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...settings,
      llmProvider: provider === "openrouter" ? "gemini" : provider,
      geminiApiKey: apiKey.trim(),
      geminiModel: model,
      groqApiKey: groqKey.trim(),
      groqModel,
      sqlDialect: "sqlserver",
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            Configurações de IA & SQL
          </DialogTitle>
          <DialogDescription>
            Ajuste o modelo de inteligência e o dialeto do RM.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Provedor de IA
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={provider === "gemini" ? "default" : "outline"}
                onClick={() => setProvider("gemini")}
                className="h-10 text-xs gap-1"
              >
                Gemini
                {provider === "gemini" && <Check className="h-3 w-3" />}
              </Button>
              <Button
                type="button"
                variant={provider === "groq" ? "default" : "outline"}
                onClick={() => setProvider("groq")}
                className="h-10 text-xs gap-1"
              >
                Groq
                {provider === "groq" && <Check className="h-3 w-3" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled
                className="h-10 text-xs opacity-50"
              >
                OpenRouter
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Se o provedor principal falhar, o outro será tentado automaticamente (se configurado).
            </p>
          </div>

          {provider === "groq" ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Chave de API Groq
                  </Label>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Obter chave grátis <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <Input
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_..."
                  className="font-mono text-sm"
                />
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 shrink-0" />
                  Salva apenas localmente no seu navegador.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  Modelo de Linguagem (Groq)
                </Label>
                <select
                  value={groqModel}
                  onChange={(e) => setGroqModel(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="llama3-70b-8192">Llama 3 70B (Recomendado)</option>
                  <option value="llama-3.1-70b-versatile">Llama 3.1 70B (Versatile)</option>
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B (Rápido)</option>
                  <option value="qwen/qwen3-32b">Qwen3 32B (Raciocínio)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Chave de API Gemini
                  </Label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Obter chave grátis <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="font-mono text-sm"
                />
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 shrink-0" />
                  Salva apenas localmente no seu navegador.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  Modelo de Linguagem (Gemini)
                </Label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Recomendado)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Estável)</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Banco de Dados do TOTVS RM
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={dialect === "sqlserver" ? "default" : "outline"}
                onClick={() => setDialect("sqlserver")}
                className="h-10 text-xs gap-2"
              >
                SQL Server
                {dialect === "sqlserver" && <Check className="h-3 w-3" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled
                className="h-10 text-xs opacity-50"
              >
                Oracle (Em breve)
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="min-w-32">
              {savedNotice ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Salvo!
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
