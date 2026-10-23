"use client";

import { createBrowserClient } from "@supabase/ssr";

const OBSERVATORIO_HML_HOST = "hrpathjcxyzzwxgkhwnt.supabase.co";

export function createObservatorioEditorialBrowserClient() {
  const url = process.env.NEXT_PUBLIC_OBSERVATORIO_HML_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_OBSERVATORIO_HML_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("editorial_hml_auth_not_configured");
  if (new URL(url).hostname !== OBSERVATORIO_HML_HOST) throw new Error("editorial_hml_auth_invalid_project");
  return createBrowserClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: "camini-observatorio-editorial-hml-auth" },
  });
}
