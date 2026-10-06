"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type RadarAdminAcao = {
  id: string;
  edicao_id: string;
  acao: "aprovar" | "rejeitar" | "arquivar";
  status: "pendente" | "processado" | "erro";
  motivo: string | null;
  realizado_por: string;
  created_at: string;
  processed_at: string | null;
};

// Precisamos do tipo de edicao, podemos importar do lib
import type { RadarEdition } from "@/lib/radar/types";

export async function getEdicoesParaRevisao() {
  const supabase = await createClient();
  
  // Pega edições pendentes de revisão (ex: candidate) ou que possam ser arquivadas
  const { data, error } = await supabase
    .from("radar_edicoes")
    .select("*")
    .in("status", ["candidate", "approved", "rejected"]) // status que o admin pode agir
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar edições do radar:", error);
    return [];
  }
  return data as RadarEdition[];
}

export async function getFilaAcoes() {
  const supabase = await createClient();
  
  // Pega ações pendentes ou recentes na fila
  const { data, error } = await supabase
    .from("radar_admin_acoes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Erro ao buscar fila de ações:", error);
    return [];
  }
  return data as RadarAdminAcao[];
}

export async function enqueueRadarAction(
  edicao_id: string,
  acao: "aprovar" | "rejeitar" | "arquivar",
  motivo?: string
) {
  const supabase = await createClient();

  // Verifica permissão pegando o email atual
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.email) {
    return { error: "Usuário não autenticado ou sem e-mail." };
  }

  // Insere na fila (será processado pelo background worker)
  const { error } = await supabase.from("radar_admin_acoes").insert({
    edicao_id,
    acao,
    motivo: motivo || null,
    realizado_por: userData.user.email,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/radar");
  return { success: true };
}
