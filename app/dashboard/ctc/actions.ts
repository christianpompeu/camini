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

export type SituacaoAula =
  | "Planejada"
  | "A confirmar"
  | "Confirmada"
  | "Realizada"
  | "Reprogramada"
  | "Cancelada"
  | "Sem aula"
  | "Feriado";

export type TipoOcorrenciaAula =
  | "Aula"
  | "Sem aula"
  | "Feriado"
  | "Atividade especial"
  | "A confirmar";

export type ModalidadeAula = "Presencial" | "Remoto";

export type Aula = {
  id: string;
  disciplina_id: string | null;
  professor_id: string;
  data_hora: string;
  duracao_minutos: number;
  created_at: string;
  data_hora_fim?: string | null;
  modalidade?: string | null;
  situacao?: SituacaoAula;
  tipo_ocorrencia?: TipoOcorrenciaAula;
  motivo?: string | null;
  observacoes?: string | null;
  // Joins
  disciplina?: Disciplina | null;
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
// VÍNCULOS E DEPENDÊNCIAS (CTC)
// ==========================================

export type CtcDependencyType = "professor" | "disciplina";

export async function getCtcDependencyCount({
  type,
  id,
}: {
  type: CtcDependencyType;
  id: string;
}): Promise<{ count: number; error?: string }> {
  try {
    const supabase = await createClient();
    const column = type === "professor" ? "professor_id" : "disciplina_id";
    const { count, error } = await supabase
      .from("ctc_aulas")
      .select("id", { count: "exact", head: true })
      .eq(column, id);

    if (error) {
      console.error(`Erro ao verificar vínculos de ${type}:`, error);
      return { count: 0, error: "Não foi possível verificar as aulas vinculadas no momento." };
    }

    return { count: count ?? 0 };
  } catch (err) {
    console.error(`Erro inesperado ao verificar dependências de ${type}:`, err);
    return { count: 0, error: "Falha de comunicação ao verificar as dependências." };
  }
}

function formatCtcDeleteError(
  type: CtcDependencyType,
  error: { code?: string; message?: string }
): string {
  // Trata especificamente a violação de integridade referencial (FK RESTRICT)
  if (error.code === "23503") {
    if (type === "professor") {
      return "Não é possível excluir este professor porque existem aulas vinculadas a ele. Transfira ou remova as aulas antes de excluir.";
    }
    return "Não é possível excluir esta disciplina porque existem aulas vinculadas a ela. Transfira ou remova as aulas antes de excluir.";
  }
  return error.message || "Erro desconhecido ao tentar realizar a exclusão.";
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

export async function updateProfessor(id: string, formData: FormData) {
  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const telefone = formData.get("telefone") as string;

  if (!nome || !nome.trim()) return { error: "Nome é obrigatório." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("ctc_professores")
    .update({
      nome: nome.trim(),
      email: email?.trim() || null,
      telefone: telefone?.trim() || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/ctc/professores");
  revalidatePath("/dashboard/ctc/aulas");
  revalidatePath("/ctc/calendario");
  return { success: true };
}

export async function deleteProfessor(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ctc_professores").delete().eq("id", id);
  if (error) {
    return { error: formatCtcDeleteError("professor", error) };
  }

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

export async function updateDisciplina(id: string, formData: FormData) {
  const nome = formData.get("nome") as string;
  const descricao = formData.get("descricao") as string;
  const carga_horaria_str = formData.get("carga_horaria") as string;

  if (!nome || !nome.trim()) return { error: "Nome é obrigatório." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("ctc_disciplinas")
    .update({
      nome: nome.trim(),
      descricao: descricao?.trim() || null,
      carga_horaria: carga_horaria_str ? parseInt(carga_horaria_str) : null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/ctc/disciplinas");
  revalidatePath("/dashboard/ctc/aulas");
  revalidatePath("/ctc/calendario");
  return { success: true };
}

export async function deleteDisciplina(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ctc_disciplinas").delete().eq("id", id);
  if (error) {
    return { error: formatCtcDeleteError("disciplina", error) };
  }

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
  const tipo_ocorrencia = (formData.get("tipo_ocorrencia") as TipoOcorrenciaAula) || "Aula";
  const data_hora = formData.get("data_hora") as string;
  const duracao_str = formData.get("duracao_minutos") as string;
  const duracao_minutos = duracao_str ? parseInt(duracao_str) : 60;
  const modalidade = (formData.get("modalidade") as string) || "Presencial";
  const motivoRaw = (formData.get("motivo") as string)?.trim() || null;
  const observacoes = (formData.get("observacoes") as string)?.trim() || null;
  const rawDisciplinaId = (formData.get("disciplina_id") as string)?.trim() || null;
  const rawProfessorId = (formData.get("professor_id") as string)?.trim() || null;

  if (!data_hora) {
    return { error: "A data e horário de início são obrigatórios." };
  }

  let situacao: SituacaoAula = "Planejada";
  let disciplina_id: string | null = null;
  let motivo: string | null = motivoRaw;

  if (tipo_ocorrencia === "Aula") {
    situacao = "Planejada";
    if (!rawDisciplinaId) {
      return { error: "Para registrar uma aula, selecione a disciplina." };
    }
    if (!rawProfessorId) {
      return { error: "Para registrar uma aula, selecione o professor responsável." };
    }
    disciplina_id = rawDisciplinaId;
  } else if (tipo_ocorrencia === "Sem aula") {
    situacao = "Sem aula";
    disciplina_id = null;
    motivo = motivoRaw || "Sem aula";
  } else if (tipo_ocorrencia === "Feriado") {
    situacao = "Feriado";
    disciplina_id = null;
    motivo = motivoRaw || "Feriado";
  } else if (tipo_ocorrencia === "A confirmar") {
    situacao = "A confirmar";
    disciplina_id = rawDisciplinaId;
    motivo = motivoRaw || "A confirmar";
  } else if (tipo_ocorrencia === "Atividade especial") {
    situacao = "Planejada";
    disciplina_id = rawDisciplinaId;
    if (!motivoRaw) {
      return { error: "Informe o motivo ou descrição da atividade especial." };
    }
    motivo = motivoRaw;
  }

  const supabase = await createClient();

  // professor_id é NOT NULL no schema do banco
  let professor_id = rawProfessorId;
  if (!professor_id) {
    // Buscar fallback default de professor (primeiro professor cadastrado)
    const { data: defaultProf } = await supabase
      .from("ctc_professores")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (defaultProf?.id) {
      professor_id = defaultProf.id;
    } else {
      return { error: "Nenhum professor disponível para vincular ao registro." };
    }
  }

  // Calcular data_hora_fim se possível
  let data_hora_fim: string | null = null;
  try {
    const d = new Date(data_hora);
    if (!isNaN(d.getTime())) {
      data_hora_fim = new Date(d.getTime() + duracao_minutos * 60000).toISOString();
    }
  } catch {}

  const { error } = await supabase.from("ctc_aulas").insert({
    tipo_ocorrencia,
    situacao,
    disciplina_id,
    professor_id,
    data_hora,
    duracao_minutos,
    data_hora_fim,
    modalidade: tipo_ocorrencia === "Sem aula" || tipo_ocorrencia === "Feriado" ? (modalidade || "Presencial") : modalidade,
    motivo,
    observacoes,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/ctc/aulas");
  revalidatePath("/ctc/calendario");
  return { success: true };
}

export async function updateAula(id: string, formData: FormData) {
  const tipo_ocorrencia = (formData.get("tipo_ocorrencia") as TipoOcorrenciaAula) || "Aula";
  const data_hora = formData.get("data_hora") as string;
  const duracao_str = formData.get("duracao_minutos") as string;
  const duracao_minutos = duracao_str ? parseInt(duracao_str) : 60;
  const modalidade = (formData.get("modalidade") as string) || "Presencial";
  const motivoRaw = (formData.get("motivo") as string)?.trim() || null;
  const observacoes = (formData.get("observacoes") as string)?.trim() || null;
  const rawDisciplinaId = (formData.get("disciplina_id") as string)?.trim() || null;
  const rawProfessorId = (formData.get("professor_id") as string)?.trim() || null;

  if (!data_hora) {
    return { error: "A data e horário de início são obrigatórios." };
  }

  const supabase = await createClient();

  const { data: currentAula } = await supabase
    .from("ctc_aulas")
    .select("*")
    .eq("id", id)
    .single();

  let situacao: SituacaoAula = "Planejada";
  let disciplina_id: string | null = null;
  let motivo: string | null = motivoRaw;

  if (tipo_ocorrencia === "Aula") {
    // Se estava em "Sem aula" ou "Feriado", volta para "Planejada". Caso contrário, preserva
    if (
      currentAula?.situacao &&
      !["Sem aula", "Feriado"].includes(currentAula.situacao)
    ) {
      situacao = currentAula.situacao as SituacaoAula;
    } else {
      situacao = "Planejada";
    }
    if (!rawDisciplinaId) {
      return { error: "Para aulas normais, a disciplina é obrigatória." };
    }
    disciplina_id = rawDisciplinaId;
  } else if (tipo_ocorrencia === "Sem aula") {
    situacao = "Sem aula";
    disciplina_id = null; // Limpa a disciplina obrigatoriamente
    motivo = motivoRaw || "Sem aula";
  } else if (tipo_ocorrencia === "Feriado") {
    situacao = "Feriado";
    disciplina_id = null; // Limpa a disciplina obrigatoriamente
    motivo = motivoRaw || "Feriado";
  } else if (tipo_ocorrencia === "A confirmar") {
    situacao = "A confirmar";
    disciplina_id = rawDisciplinaId;
    motivo = motivoRaw || "A confirmar";
  } else if (tipo_ocorrencia === "Atividade especial") {
    situacao = (currentAula?.situacao && !["Sem aula", "Feriado"].includes(currentAula.situacao))
      ? currentAula.situacao as SituacaoAula
      : "Planejada";
    disciplina_id = rawDisciplinaId;
    if (!motivoRaw) {
      return { error: "Informe o motivo ou descrição da atividade especial." };
    }
    motivo = motivoRaw;
  }

  // Preservar ou atualizar professor_id (NOT NULL no schema)
  const professor_id = rawProfessorId || currentAula?.professor_id;
  if (!professor_id) {
    return { error: "Professor não encontrado para a aula." };
  }

  // Calcular data_hora_fim se possível
  let data_hora_fim: string | null = null;
  try {
    const d = new Date(data_hora);
    if (!isNaN(d.getTime())) {
      data_hora_fim = new Date(d.getTime() + duracao_minutos * 60000).toISOString();
    }
  } catch {}

  const { error } = await supabase
    .from("ctc_aulas")
    .update({
      tipo_ocorrencia,
      situacao,
      disciplina_id,
      professor_id,
      data_hora,
      duracao_minutos,
      data_hora_fim,
      modalidade: tipo_ocorrencia === "Sem aula" || tipo_ocorrencia === "Feriado" ? (currentAula?.modalidade || "Presencial") : modalidade,
      motivo,
      observacoes,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/ctc/aulas");
  revalidatePath("/ctc/calendario");
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
