"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { invalidatePublicRoutesCache } from "@/lib/supabase/middleware";

export type AppPermission = {
  id: string;
  email: string;
  is_super_admin: boolean;
  allowed_routes: string[];
};

export async function getPermissions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_permissions")
    .select("*")
    .order("is_super_admin", { ascending: false })
    .order("email", { ascending: true });

  if (error) {
    console.error("Erro ao buscar permissoes:", error?.message || error?.code || JSON.stringify(error));
    return [];
  }
  return data as AppPermission[];
}

export async function addPermission(email: string, isSuperAdmin: boolean, route?: string) {
  const supabase = await createClient();
  
  // Buscar se ja existe
  const { data: existing } = await supabase
    .from("app_permissions")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (existing) {
    let newRoutes = existing.allowed_routes || [];
    if (route && !newRoutes.includes(route)) {
      newRoutes.push(route);
    }
    const { error } = await supabase
      .from("app_permissions")
      .update({ 
        is_super_admin: isSuperAdmin ? true : existing.is_super_admin,
        allowed_routes: newRoutes
      })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("app_permissions")
      .insert({
        email: email.trim().toLowerCase(),
        is_super_admin: isSuperAdmin,
        allowed_routes: route ? [route] : []
      });
    if (error) return { error: error.message };
  }

  revalidatePath("/dashboard/permissoes");
  return { success: true };
}

export async function removeSuperAdmin(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("app_permissions")
    .update({ is_super_admin: false })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/permissoes");
  return { success: true };
}

export async function removeRoute(id: string, route: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("app_permissions")
    .select("allowed_routes")
    .eq("id", id)
    .single();

  if (existing) {
    const newRoutes = (existing.allowed_routes || []).filter((r: string) => r !== route);
    const { error } = await supabase
      .from("app_permissions")
      .update({ allowed_routes: newRoutes })
      .eq("id", id);
    if (error) return { error: error.message };
  }

  revalidatePath("/dashboard/permissoes");
  return { success: true };
}

export async function deleteUserPermission(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("app_permissions").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/permissoes");
  return { success: true };
}

export type PublicRoute = {
  route_path: string;
  is_public: boolean;
};

export async function getPublicRoutes() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("public_routes").select("*");
  if (error) {
    console.error("Erro ao buscar public_routes:", error.message);
    return [];
  }
  return data as PublicRoute[];
}

export async function togglePublicRoute(routePath: string, isPublic: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("public_routes")
    .upsert({ route_path: routePath, is_public: isPublic }, { onConflict: "route_path" });
  
  if (error) return { error: error.message };

  invalidatePublicRoutesCache();
  revalidatePath("/dashboard/permissoes");
  return { success: true };
}
