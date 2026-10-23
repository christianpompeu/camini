"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import { getEditorialHmlStatus } from "@/app/dashboard/observatorio/actions";
import { createObservatorioEditorialBrowserClient } from "@/lib/observatorio/editorial-auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EditorialStatus = "connecting" | "disconnected" | "authenticated" | "unauthorized" | "expired";
type EditorialContextValue = { accessToken: string | null; status: EditorialStatus };
const EditorialContext = createContext<EditorialContextValue>({ accessToken: null, status: "disconnected" });

function statusLabel(status: EditorialStatus) {
  if (status === "connecting") return "Conectando sessao editorial HML";
  if (status === "authenticated") return "Sessao editorial HML autenticada e autorizada";
  if (status === "unauthorized") return "Sessao HML autenticada, sem permissao editorial";
  if (status === "expired") return "Sessao editorial HML expirada";
  return "Sessao editorial HML desconectada";
}

export function useEditorialHmlSession() { return useContext(EditorialContext); }

export function EditorialHmlSessionProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => { try { return createObservatorioEditorialBrowserClient(); } catch { return null; } });
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<EditorialStatus>(() => client ? "connecting" : "disconnected");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(() => client ? "" : "Configure uma URL e uma chave publica do Auth HML para conectar a revisao editorial.");

  async function validate(nextSession: Session | null) {
    setSession(nextSession);
    if (!nextSession) { setStatus("disconnected"); return; }
    setStatus("connecting");
    const result = await getEditorialHmlStatus(nextSession.access_token);
    setStatus(result === "authorized" ? "authenticated" : result);
  }

  useEffect(() => {
    if (!client) return;
    let active = true;
    void client.auth.getSession().then(({ data }) => { if (active) void validate(data.session); });
    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => { if (active) void validate(nextSession); });
    return () => { active = false; subscription.subscription.unsubscribe(); };
  }, [client]);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    setStatus("connecting"); setMessage("");
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.session) { setStatus("disconnected"); setMessage("Nao foi possivel autenticar no Auth HML editorial."); return; }
    setPassword(""); await validate(data.session);
  }

  async function signOut() {
    if (client) await client.auth.signOut();
    setSession(null); setStatus("disconnected"); setMessage("");
  }

  const value = useMemo(() => ({ accessToken: status === "authenticated" ? session?.access_token ?? null : null, status }), [session, status]);
  return <EditorialContext.Provider value={value}>
    <Card variant="outline" className="mb-6 border-primary/15 bg-primary/[0.03]">
      <CardHeader className="pb-3"><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="size-4 text-primary" />Revisao editorial HML</CardTitle><Badge variant={status === "authenticated" ? "success" : status === "unauthorized" ? "warning" : "outline"}>{statusLabel(status)}</Badge></div></CardHeader>
      <CardContent className="space-y-3">
        {status === "authenticated" ? <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">A identidade editorial HML foi validada pelo Supabase Auth e esta na allowlist ativa.</p><Button type="button" variant="outline" onClick={signOut}><LogOut className="size-4" />Desconectar revisao</Button></div> : <form onSubmit={signIn} className="flex flex-wrap items-end gap-3"><label className="grid gap-1 text-sm">E-mail HML<input className="h-9 rounded-md border bg-background px-3" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label className="grid gap-1 text-sm">Senha HML<input className="h-9 rounded-md border bg-background px-3" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><Button type="submit" disabled={status === "connecting"}><LogIn className="size-4" />Conectar revisao editorial</Button></form>}
        {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
        {status === "unauthorized" && <p className="text-sm text-muted-foreground">A sessao HML e valida, mas este usuario nao possui permissao editorial ativa.</p>}
        {status === "expired" && <p className="text-sm text-destructive">A sessao HML nao pode ser validada. Conecte novamente.</p>}
      </CardContent>
    </Card>
    {children}
  </EditorialContext.Provider>;
}
