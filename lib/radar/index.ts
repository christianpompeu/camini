import { createPublicClient } from "@/lib/supabase/server";
import type { RadarEdition } from "./types";

/**
 * Consulta todas as edições publicadas do Radar.
 * Garante RLS e filtro explícito de domínio:
 * status = 'published' AND is_test = false.
 */
export async function getPublishedRadarEditions(): Promise<RadarEdition[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("radar_edicoes")
      .select("*")
      .eq("status", "published")
      .eq("is_test", false)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("numero", { ascending: false });

    if (error) {
      console.error("Erro ao buscar edições do Radar:", error);
      return [];
    }

    return (data || []) as RadarEdition[];
  } catch (err) {
    console.error("Falha ao consultar edições do Radar:", err);
    return [];
  }
}

/**
 * Busca a edição publicada mais recente do Radar.
 */
export async function getLatestRadarEdition(): Promise<RadarEdition | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("radar_edicoes")
      .select("*")
      .eq("status", "published")
      .eq("is_test", false)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("numero", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as RadarEdition;
  } catch (err) {
    console.error("Falha ao consultar edição mais recente do Radar:", err);
    return null;
  }
}

/**
 * Busca uma edição publicada pelo slug exato.
 * Retorna null se não existir ou se não for 'published' ou for 'is_test=true' (tratado como 404).
 */
export async function getRadarEditionBySlug(
  slug: string
): Promise<RadarEdition | null> {
  if (!slug) return null;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("radar_edicoes")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .eq("is_test", false)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as RadarEdition;
  } catch (err) {
    console.error(`Falha ao consultar edição slug=${slug}:`, err);
    return null;
  }
}

/**
 * Obtém a edição anterior e a próxima para navegação entre artigos editoriais.
 */
export async function getRadarEditionNavigation(currentNumero: number): Promise<{
  previous: RadarEdition | null;
  next: RadarEdition | null;
}> {
  try {
    const supabase = createPublicClient();
    const [prevRes, nextRes] = await Promise.all([
      supabase
        .from("radar_edicoes")
        .select("id, numero, slug, titulo")
        .eq("status", "published")
        .eq("is_test", false)
        .lt("numero", currentNumero)
        .order("numero", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("radar_edicoes")
        .select("id, numero, slug, titulo")
        .eq("status", "published")
        .eq("is_test", false)
        .gt("numero", currentNumero)
        .order("numero", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      previous: (prevRes.data as RadarEdition) || null,
      next: (nextRes.data as RadarEdition) || null,
    };
  } catch {
    return { previous: null, next: null };
  }
}

/**
 * Agrega e conta todas as tags disponíveis nas edições publicadas.
 */
export function extractUniqueTags(
  editions: RadarEdition[]
): { tag: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const ed of editions) {
    if (Array.isArray(ed.tags)) {
      for (const t of ed.tags) {
        if (t && typeof t === "string") {
          counts[t] = (counts[t] || 0) + 1;
        }
      }
    }
  }
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
