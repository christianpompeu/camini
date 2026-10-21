import "server-only";

import { createClient as createSessionClient } from "@/lib/supabase/server";
import { ObservatorioAccessError } from "./errors.ts";
import {
  readPrivateObservatorioGraph,
  readPrivateObservatorioSnapshot,
  type PrivateSnapshotOptions,
} from "./supabase-read-repository.ts";

export { ingestObservatorioBatchInHml } from "./supabase-ingestion.ts";

async function assertObservatorioAccess() {
  const supabase = await createSessionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) throw new ObservatorioAccessError();

  const { data: permission, error: permissionError } = await supabase
    .from("app_permissions")
    .select("is_super_admin,allowed_routes")
    .eq("email", user.email)
    .maybeSingle();

  const allowed = permission?.is_super_admin === true ||
    permission?.allowed_routes?.includes("/dashboard/observatorio") === true;
  if (permissionError || !allowed) throw new ObservatorioAccessError();
}

export async function readAuthorizedObservatorioSnapshot(
  options: PrivateSnapshotOptions = {}
) {
  await assertObservatorioAccess();
  return readPrivateObservatorioSnapshot(options);
}

export async function readAuthorizedObservatorioGraph(limit = 500) {
  await assertObservatorioAccess();
  return readPrivateObservatorioGraph(limit);
}
