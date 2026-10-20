import { ObservatorioValidationError } from "./errors.ts";

const TRACKING_PARAMETERS = new Set([
  "fbclid",
  "gclid",
  "dclid",
  "msclkid",
  "igshid",
  "mc_cid",
  "mc_eid",
  "ref_src",
]);

function isTrackingParameter(name: string) {
  const normalized = name.toLowerCase();
  return normalized.startsWith("utm_") || TRACKING_PARAMETERS.has(normalized);
}

export function canonicalizeUrl(value: string): string {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new ObservatorioValidationError([
      { path: "url", message: "URL absoluta invalida." },
    ]);
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ObservatorioValidationError([
      { path: "url", message: "A URL deve usar HTTP ou HTTPS." },
    ]);
  }

  if (url.username || url.password) {
    throw new ObservatorioValidationError([
      { path: "url", message: "A URL nao pode conter credenciais." },
    ]);
  }

  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();
  url.hash = "";

  if ((url.protocol === "https:" && url.port === "443") ||
      (url.protocol === "http:" && url.port === "80")) {
    url.port = "";
  }

  const parameters = [...url.searchParams.entries()]
    .filter(([name]) => !isTrackingParameter(name))
    .sort(([nameA, valueA], [nameB, valueB]) =>
      nameA.localeCompare(nameB) || valueA.localeCompare(valueB)
    );

  url.search = "";
  for (const [name, parameterValue] of parameters) {
    url.searchParams.append(name, parameterValue);
  }

  url.pathname = url.pathname.replace(/\/{2,}/g, "/");
  if (url.pathname !== "/") {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }

  return url.toString();
}

export function canonicalizeDomain(value: string): string {
  const candidate = value.includes("://") ? value : `https://${value}`;
  let url: URL;

  try {
    url = new URL(candidate);
  } catch {
    throw new ObservatorioValidationError([
      { path: "dominio", message: "Dominio invalido." },
    ]);
  }

  return url.hostname.toLowerCase().replace(/^www\./, "");
}

export function domainFromCanonicalUrl(canonicalUrl: string): string {
  return canonicalizeDomain(new URL(canonicalUrl).hostname);
}

export function normalizeTimestamp(
  value: string | Date,
  path = "data"
): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new ObservatorioValidationError([
        { path, message: "Data invalida." },
      ]);
    }
    return value.toISOString();
  }

  const normalized = value.trim();
  if (!/(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized)) {
    throw new ObservatorioValidationError([
      {
        path,
        message: "Data/hora deve incluir fuso explicito (Z ou offset).",
      },
    ]);
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    throw new ObservatorioValidationError([
      { path, message: "Data/hora invalida." },
    ]);
  }

  return parsed.toISOString();
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
