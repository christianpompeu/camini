"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ==========================================
// Tipagens Auxiliares
// ==========================================
export type Professor = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  created_at: string;
};

export type Disciplina = {
  id: string;
  nome: string;
  descricao: string | null;
  carga_horaria: number | null;
  created_at: string;
};

export type Aula = {
  id: string;
  disciplina_id: string;
  professor_id: string;
  data_hora: string;
  duracao_minutos: number;
  created_at: string;
  // Joins
  disciplina?: Disciplina;
  professor?: Professor;
};

// ==========================================
// ESTATÍSTICAS E CONTADORES
// ==========================================

export async function getCtcStats() {
  const supabase = await createClient();
  const [professoresRes, disciplinasRes, aulasRes] = await Promise.all([
    supabase.from("ctc_professores").select("*", { count: "exact", head: true }),
    supabase.from("ctc_disciplinas").select("*", { count: "exact", head: true }),
    supabase.from("ctc_aulas").select("*", { count: "exact", head: true }),
  ]);

  return {
    professores: professoresRes.count ?? 0,
    disciplinas: disciplinasRes.count ?? 0,
    aulas: aulasRes.count ?? 0,
  };
}

// ==========================================
// CRUD PROFESSORES
// ==========================================

export async function getProfessores() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ctc_professores")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao buscar professores:", error);
    return [];
  }
  return data as Professor[];
}

export async function createProfessor(formData: FormData) {
  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const telefone = formData.get("telefone") as string;

  if (!nome) return { error: "Nome é obrigatório." };

  const supabase = await createClient();
  const { error } = await supabase.from("ctc_professores").insert({
    nome,
    email: email || null,
    telefone: telefone || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/ctc/professores");
  revalidatePath("/dashboard/ctc/aulas");
  return { success: true };
}

export async function deleteProfessor(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ctc_professores").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/ctc/professores");
  revalidatePath("/dashboard/ctc/aulas");
  return { success: true };
}

// ==========================================
// CRUD DISCIPLINAS
// ==========================================

export async function getDisciplinas() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ctc_disciplinas")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao buscar disciplinas:", error);
    return [];
  }
  return data as Disciplina[];
}

export async function createDisciplina(formData: FormData) {
  const nome = formData.get("nome") as string;
  const descricao = formData.get("descricao") as string;
  const carga_horaria_str = formData.get("carga_horaria") as string;
  
  if (!nome) return { error: "Nome é obrigatório." };

  const supabase = await createClient();
  const { error } = await supabase.from("ctc_disciplinas").insert({
    nome,
    descricao: descricao || null,
    carga_horaria: carga_horaria_str ? parseInt(carga_horaria_str) : null,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/ctc/disciplinas");
  revalidatePath("/dashboard/ctc/aulas");
  return { success: true };
}

export async function deleteDisciplina(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ctc_disciplinas").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/ctc/disciplinas");
  revalidatePath("/dashboard/ctc/aulas");
  return { success: true };
}

// ==========================================
// CRUD AULAS
// ==========================================

export async function getAulas() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ctc_aulas")
    .select("*, disciplina:ctc_disciplinas(*), professor:ctc_professores(*)")
    .order("data_hora", { ascending: true });

  if (error) {
    console.error("Erro ao buscar aulas:", error);
    return [];
  }
  return data as Aula[];
}

export async function createAula(formData: FormData) {
  const disciplina_id = formData.get("disciplina_id") as string;
  const professor_id = formData.get("professor_id") as string;
  const data_hora = formData.get("data_hora") as string;
  const duracao_str = formData.get("duracao_minutos") as string;

  if (!disciplina_id || !professor_id || !data_hora) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ctc_aulas").insert({
    disciplina_id,
    professor_id,
    data_hora,
    duracao_minutos: duracao_str ? parseInt(duracao_str) : 60,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/ctc/aulas");
  revalidatePath("/ctc/calendario"); // Caso exista página pública
  return { success: true };
}

export async function deleteAula(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ctc_aulas").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/ctc/aulas");
  revalidatePath("/ctc/calendario");
  return { success: true };
}
