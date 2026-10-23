export type EditorialHmlStatus = "authorized" | "unauthorized" | "expired" | "error";

export function resolveEditorialHmlStatus({
  userId,
  authError,
  allowlist,
  queryError,
}: {
  userId: string | null;
  authError: boolean;
  allowlist: { ativo: boolean } | null;
  queryError: boolean;
}): EditorialHmlStatus {
  if (authError || !userId) return "expired";
  if (queryError) return "error";
  return allowlist?.ativo === true ? "authorized" : "unauthorized";
}
