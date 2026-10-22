import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { CanalObservatorio, StatusEdicao } from "./types.ts";

export type ReconciliaçãoEstado =
  | "somente_hml"
  | "correspondencia_confirmada"
  | "divergencia_status"
  | "identificador_nao_confirmado"
  | "informacao_insuficiente";

export interface EditorialEdition {
  id: string;
  identificador: string;
  titulo: string;
  canal: CanalObservatorio;
  resumo: string;
  status: StatusEdicao;
  revisao: "pendente" | "em_revisao" | "concluida" | "indisponivel";
  slug: string | null;
  supabaseId: string;
  origem: "Supabase HML";
  criadaEm: string;
  publicadaEm: string | null;
  notionUrl: string | null;
  reconciliacao: ReconciliaçãoEstado;
}

export interface EditorialQueue {
  editions: EditorialEdition[];
  notionAvailable: boolean;
  hmlAvailable: boolean;
  notice: string | null;
}

function hmlClient() {
  const url = process.env.OBSERVATORIO_HML_SUPABASE_URL;
  const secret = process.env.OBSERVATORIO_HML_SUPABASE_SECRET_KEY;
  if (!url || !secret) return null;
  try {
    if (new URL(url).hostname !== "hrpathjcxyzzwxgkhwnt.supabase.co") return null;
  } catch {
    return null;
  }
  return createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function revisionForStatus(status: StatusEdicao): EditorialEdition["revisao"] {
  if (status === "candidata") return "pendente";
  if (status === "aprovada" || status === "publicada") return "concluida";
  return "indisponivel";
}

export async function readEditorialQueue(): Promise<EditorialQueue> {
  const client = hmlClient();
  if (!client) {
    return {
      editions: [],
      notionAvailable: false,
      hmlAvailable: false,
      notice: "A configuração server-only do HML está indisponível para esta sessão.",
    };
  }

  const { data, error } = await client
    .from("observatorio_edicoes")
    .select("id,identificador,canal,titulo,resumo,status,criada_em,publicada_em,notion_url")
    .order("criada_em", { ascending: false });

  if (error) {
    return {
      editions: [],
      notionAvailable: false,
      hmlAvailable: false,
      notice: "Não foi possível ler as edições do HML nesta sessão.",
    };
  }

  return {
    editions: (data ?? []).map((edition) => ({
      id: edition.id,
      identificador: edition.identificador,
      titulo: edition.titulo,
      canal: edition.canal as CanalObservatorio,
      resumo: edition.resumo,
      status: edition.status as StatusEdicao,
      revisao: revisionForStatus(edition.status as StatusEdicao),
      slug: null,
      supabaseId: edition.id,
      origem: "Supabase HML",
      criadaEm: edition.criada_em,
      publicadaEm: edition.publicada_em,
      notionUrl: edition.notion_url,
      reconciliacao: "informacao_insuficiente",
    })),
    notionAvailable: false,
    hmlAvailable: true,
    notice: "Notion não está conectado server-side; a reconciliação permanece somente informativa.",
  };
}
