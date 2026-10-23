import "server-only";

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  isPublicEditionForChannel,
  isValidPublicEditionIdentifier,
  selectPublicEditions,
} from "./publication";
import type { CanalObservatorio, Edicao } from "./types";

const OBSERVATORIO_HML_HOST = "hrpathjcxyzzwxgkhwnt.supabase.co";

function createPublicObservatorioClient() {
  const url = process.env.OBSERVATORIO_HML_SUPABASE_URL;
  const secret = process.env.OBSERVATORIO_HML_SUPABASE_SECRET_KEY;
  if (!url || !secret) return null;

  try {
    if (new URL(url).hostname !== OBSERVATORIO_HML_HOST) return null;
  } catch {
    return null;
  }

  return createClient<Database>(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Public editorial reads are deliberately fail-closed. The service credential is
 * never sent to the browser and every row is checked by the publication policy.
 */
export async function readPublicEditions(
  channel: CanalObservatorio,
): Promise<Edicao[]> {
  const supabase = createPublicObservatorioClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("observatorio_edicoes")
      .select(
        "id,identificador,canal,rodada_id,titulo,resumo,status,notion_page_id,notion_url,snapshot,versao,criada_em,aprovada_em,publicada_em",
      )
      .eq("canal", channel)
      .eq("status", "publicada")
      .not("aprovada_em", "is", null)
      .not("publicada_em", "is", null)
      .not("snapshot", "is", null)
      .order("publicada_em", { ascending: false })
      .limit(24);

    if (error || !data) return [];
    return selectPublicEditions(data as Edicao[]);
  } catch {
    return [];
  }
}

export async function readPublicEdition(
  channel: CanalObservatorio,
  identifier: string,
): Promise<Edicao | null> {
  if (!isValidPublicEditionIdentifier(identifier)) return null;

  const supabase = createPublicObservatorioClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("observatorio_edicoes")
      .select(
        "id,identificador,canal,rodada_id,titulo,resumo,status,notion_page_id,notion_url,snapshot,versao,criada_em,aprovada_em,publicada_em",
      )
      .eq("identificador", identifier)
      .eq("canal", channel)
      .eq("status", "publicada")
      .not("aprovada_em", "is", null)
      .not("publicada_em", "is", null)
      .not("snapshot", "is", null)
      .maybeSingle();

    if (error || !data) return null;
    const edition = data as Edicao;
    return isPublicEditionForChannel(edition, channel) ? edition : null;
  } catch {
    return null;
  }
}

export const loadPublicEdition = cache(readPublicEdition);
