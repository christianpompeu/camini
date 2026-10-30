/**
 * CAMINI SQL STUDIO — Sincronização Híbrida de Modelos de Consulta
 * 
 * Permite salvar modelos de consulta localmente (localStorage / cookies) quando
 * o usuário não estiver autenticado e sincronizar com o Supabase (rm_sql_templates)
 * de forma transparente quando o usuário efetuar login.
 */

import { createClient } from "../supabase/client.ts";
import { SQL_STUDIO_TEMPLATES, type SqlStudioTemplate } from "./sql-studio-templates.ts";

export interface CustomUserTemplate extends SqlStudioTemplate {
  isCustom: true;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  isSyncedWithSupabase?: boolean;
}

const LOCAL_STORAGE_TEMPLATES_KEY = "camini_sql_studio_user_templates";

/**
 * Verifica de forma segura se há um usuário autenticado no navegador.
 */
export async function getAuthUser() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Lê os modelos personalizados armazenados no localStorage.
 */
export function getLocalUserTemplates(): CustomUserTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TEMPLATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persiste a lista de modelos personalizados no localStorage.
 */
export function setLocalUserTemplates(templates: CustomUserTemplate[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_TEMPLATES_KEY, JSON.stringify(templates));
    // Fallback leve em cookie para persistência entre abas/sessões
    document.cookie = `camini_sql_templates_count=${templates.length}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Ignora erro
  }
}

/**
 * Carrega todos os modelos disponíveis:
 * 1. Modelos oficiais embutidos (Fluxus, Nucleus, Labore, Saldus)
 * 2. Modelos personalizados locais
 * 3. Modelos remotos do Supabase se o usuário estiver autenticado (fazendo merge e sincronização)
 */
export async function loadAllStudioTemplates(): Promise<{
  builtInTemplates: SqlStudioTemplate[];
  userTemplates: CustomUserTemplate[];
  isAuthenticated: boolean;
  userEmail?: string;
}> {
  const localCustom = getLocalUserTemplates();
  const user = await getAuthUser();

  if (!user) {
    return {
      builtInTemplates: SQL_STUDIO_TEMPLATES,
      userTemplates: localCustom.map((t) => ({ ...t, isSyncedWithSupabase: false })),
      isAuthenticated: false,
    };
  }

  // Usuário autenticado: sincroniza com a tabela 'rm_sql_templates'
  try {
    const supabase = createClient();
    const { data: remoteTemplates, error } = await supabase
      .from("rm_sql_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("atualizado_em", { ascending: false });

    if (error || !remoteTemplates) {
      console.warn("Aviso ao carregar modelos remotos do Supabase:", error?.message);
      return {
        builtInTemplates: SQL_STUDIO_TEMPLATES,
        userTemplates: localCustom,
        isAuthenticated: true,
        userEmail: user.email,
      };
    }

    // Mapeia do schema do Supabase para a interface do Studio
    const formattedRemote: CustomUserTemplate[] = remoteTemplates.map((r) => ({
      id: r.id,
      title: r.titulo,
      category: (r.categoria as SqlStudioTemplate["category"]) || "personalizado",
      moduleLabel: r.modulo_label || "Personalizado",
      description: r.descricao || "",
      mainTables: Array.isArray(r.tabelas_principais) ? r.tabelas_principais : [],
      sql: r.sql,
      isCustom: true,
      userId: r.user_id,
      createdAt: r.criado_em,
      updatedAt: r.atualizado_em,
      isSyncedWithSupabase: true,
    }));

    // Se houver templates locais não sincronizados, faz upsert para a nuvem
    const remoteIds = new Set(formattedRemote.map((r) => r.id));
    for (const local of localCustom) {
      if (!remoteIds.has(local.id)) {
        try {
          await supabase.from("rm_sql_templates").insert({
            id: local.id.includes("-") ? local.id : undefined,
            user_id: user.id,
            titulo: local.title,
            descricao: local.description,
            categoria: local.category,
            modulo_label: local.moduleLabel,
            tabelas_principais: local.mainTables,
            sql: local.sql,
          });
          local.isSyncedWithSupabase = true;
          formattedRemote.unshift(local);
        } catch {
          // Ignora falha de insert pontual
        }
      }
    }

    // Atualiza cache local
    setLocalUserTemplates(formattedRemote);

    return {
      builtInTemplates: SQL_STUDIO_TEMPLATES,
      userTemplates: formattedRemote,
      isAuthenticated: true,
      userEmail: user.email,
    };
  } catch (err) {
    console.error("Erro na sincronização de templates com o Supabase:", err);
    return {
      builtInTemplates: SQL_STUDIO_TEMPLATES,
      userTemplates: localCustom,
      isAuthenticated: true,
      userEmail: user.email,
    };
  }
}

/**
 * Salva um novo modelo de consulta ou atualiza um existente:
 * - Salva no localStorage imediatamente
 * - Se logado, salva/upsert no Supabase
 */
export async function saveStudioTemplate(params: {
  title: string;
  description: string;
  moduleLabel?: string;
  mainTables: string[];
  sql: string;
}): Promise<CustomUserTemplate> {
  const user = await getAuthUser();
  const id = `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newTemplate: CustomUserTemplate = {
    id,
    title: params.title.trim(),
    description: params.description.trim(),
    moduleLabel: params.moduleLabel || "Personalizado",
    category: "personalizado",
    mainTables: params.mainTables,
    sql: params.sql,
    isCustom: true,
    createdAt: now,
    updatedAt: now,
    isSyncedWithSupabase: false,
  };

  // Salva localmente
  const local = getLocalUserTemplates();
  const updatedLocal = [newTemplate, ...local];
  setLocalUserTemplates(updatedLocal);

  // Se autenticado, salva no Supabase
  if (user) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("rm_sql_templates")
        .insert({
          user_id: user.id,
          titulo: newTemplate.title,
          descricao: newTemplate.description,
          categoria: newTemplate.category,
          modulo_label: newTemplate.moduleLabel,
          tabelas_principais: newTemplate.mainTables,
          sql: newTemplate.sql,
        })
        .select("id, criado_em, atualizado_em")
        .single();

      if (!error && data) {
        newTemplate.id = data.id;
        newTemplate.createdAt = data.criado_em;
        newTemplate.updatedAt = data.atualizado_em;
        newTemplate.isSyncedWithSupabase = true;
        // Atualiza no localStorage com o ID real retornado pelo Supabase
        setLocalUserTemplates([newTemplate, ...local]);
      }
    } catch (err) {
      console.warn("Aviso ao persistir modelo no Supabase:", err);
    }
  }

  return newTemplate;
}

/**
 * Exclui um modelo personalizado (local e remotamente).
 */
export async function deleteStudioTemplate(templateId: string): Promise<void> {
  const local = getLocalUserTemplates();
  const filtered = local.filter((t) => t.id !== templateId);
  setLocalUserTemplates(filtered);

  const user = await getAuthUser();
  if (user) {
    try {
      const supabase = createClient();
      await supabase
        .from("rm_sql_templates")
        .delete()
        .eq("id", templateId)
        .eq("user_id", user.id);
    } catch (err) {
      console.warn("Aviso ao deletar modelo remoto no Supabase:", err);
    }
  }
}
