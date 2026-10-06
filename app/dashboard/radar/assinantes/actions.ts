"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Assinante = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  status: "ativo" | "cancelado";
  origem: "app_forca" | "site" | "manual";
  created_at: string;
};

export async function getAssinantes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  console.log("Session User in getAssinantes:", user?.email);

  const { data, error } = await supabase
    .from("radar_assinantes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar assinantes:", error?.message || error?.code || JSON.stringify(error));
    return [];
  }
  return data as Assinante[];
}

export async function addAssinante(formData: FormData) {
  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const telefone = formData.get("telefone") as string;
  const status = (formData.get("status") as string) || "ativo";
  const origem = (formData.get("origem") as string) || "manual";

  if (!nome || !email) {
    return { error: "Nome e E-mail são obrigatórios." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("radar_assinantes").insert({
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: telefone?.trim() || null,
    status,
    origem
  });

  if (error) {
    if (error.code === "23505") return { error: "Este e-mail já está cadastrado." };
    return { error: error.message };
  }

  revalidatePath("/dashboard/radar/assinantes");
  return { success: true };
}

export async function toggleStatusAssinante(id: string, currentStatus: string) {
  const supabase = await createClient();
  const newStatus = currentStatus === "ativo" ? "cancelado" : "ativo";
  
  const { error } = await supabase
    .from("radar_assinantes")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/radar/assinantes");
  return { success: true };
}

export async function deleteAssinante(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("radar_assinantes").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/radar/assinantes");
  return { success: true };
}
