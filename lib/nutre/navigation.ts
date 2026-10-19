/**
 * Utilitários centralizados de resolução de rotas para o módulo Nutre.
 * Garante compatibilidade entre o domínio principal (camini.dev.br/nutre/...)
 * e o subdomínio dedicado (nutre.camini.dev.br/...).
 */

const CAMINI_PRIMARY_DOMAIN = "https://camini.dev.br";

/**
 * Expressão regular estrita para validação do subdomínio do Nutre.
 * Aceita nutre.camini.dev.br e portas locais de teste (ex: nutre.camini.dev.br:3000).
 */
export const NUTRE_SUBDOMAIN_REGEX = /^nutre\.camini\.dev\.br(:\d+)?$/i;

/**
 * Identifica confiavelmente se o host da requisição pertence ao subdomínio exclusivo do Nutre.
 * Não depende de nenhum cabeçalho arbitrário do cliente.
 */
export function isNutreHost(host: string | null | undefined): boolean {
  if (!host) return false;
  return NUTRE_SUBDOMAIN_REGEX.test(host.trim());
}

/**
 * Valida se um determinado pathname é permitido no subdomínio nutre.camini.dev.br.
 * Garante que o subdomínio sirva exclusivamente as rotas do Nutre e os recursos técnicos do Next.js.
 */
export function isAllowedNutreSubdomainPath(pathname: string): boolean {
  if (!pathname) return false;

  // Rotas canônicas ou internas do Nutre
  if (
    pathname === "/" ||
    pathname === "/nutre" ||
    pathname.startsWith("/nutre/") ||
    pathname === "/pacientes" ||
    pathname.startsWith("/pacientes/")
  ) {
    return true;
  }

  // Recursos técnicos do Next.js (RSC, chunks, prefetch, static, font, etc)
  if (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/_not-found"
  ) {
    return true;
  }

  // Arquivos estáticos e fontes
  if (
    /\.(svg|png|jpg|jpeg|gif|webp|woff2|woff|ttf|ico|css|js|map)$/i.test(pathname)
  ) {
    return true;
  }

  return false;
}

// Prefixos canônicos pertencentes ao módulo Nutre
const NUTRE_CANONICAL_PREFIXES = ["/pacientes", "#"];

// Rotas conhecidas do Camini Hub que não devem ser tratadas como rotas internas do Nutre
const CAMINI_CORE_PREFIXES = [
  "/dashboard",
  "/forca",
  "/radar",
  "/totvs-rm",
  "/login",
  "/auth",
  "/api",
];

/**
 * Normaliza um caminho do Nutre removendo o prefixo /nutre caso presente.
 * Exemplos:
 *   "/nutre/pacientes" -> "/pacientes"
 *   "/nutre"           -> "/"
 *   "/pacientes/novo"  -> "/pacientes/novo"
 *   "#agenda"          -> "#agenda"
 *   "/nutre#agenda"    -> "#agenda"
 */
export function normalizeNutrePath(path: string): string {
  if (!path) return "/";

  // Links externos não são alterados
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:")
  ) {
    return path;
  }

  // Tratar âncoras locais como #agenda ou /nutre#agenda
  if (path.includes("#")) {
    const [pathname, hash] = path.split("#");
    const normalizedPathname = normalizeNutrePath(pathname);
    return normalizedPathname === "/" ? `#${hash}` : `${normalizedPathname}#${hash}`;
  }

  // Remove trailing slashes (exceto se for apenas "/")
  const clean = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

  if (clean === "/nutre" || clean === "") {
    return "/";
  }

  if (clean.startsWith("/nutre/")) {
    return clean.slice("/nutre".length);
  }

  return clean.startsWith("/") ? clean : `/${clean}`;
}

/**
 * Resolve a URL final com base no contexto do host (subdomínio ou domínio principal).
 *
 * @param path Caminho relativo ou absoluto do Nutre (ex: "/pacientes", "/nutre/pacientes", "#agenda")
 * @param isSubdomain Se true, gera rotas limpas do subdomínio (ex: "/pacientes", "/").
 *                    Se false, gera rotas do domínio principal com prefixo (ex: "/nutre/pacientes", "/nutre").
 */
export function resolveNutrePath(path: string, isSubdomain: boolean): string {
  if (!path) return isSubdomain ? "/" : "/nutre";

  // Links externos não são alterados
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:")
  ) {
    return path;
  }

  // Se for rota de outro módulo do Camini Hub (/dashboard, /forca, /radar, etc)
  const isCaminiCore = CAMINI_CORE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );

  if (isCaminiCore) {
    // Se estiver no subdomínio, link para o domínio principal
    if (isSubdomain) {
      return `${CAMINI_PRIMARY_DOMAIN}${path}`;
    }
    return path;
  }

  const normalized = normalizeNutrePath(path);

  // Âncoras simples como #agenda
  if (normalized.startsWith("#")) {
    return isSubdomain ? `/${normalized}` : `/nutre${normalized}`;
  }

  // Se estiver no subdomínio nutre.camini.dev.br
  if (isSubdomain) {
    return normalized;
  }

  // Se estiver no domínio principal camini.dev.br
  if (normalized === "/") {
    return "/nutre";
  }

  return `/nutre${normalized}`;
}

/**
 * Verifica se um caminho canônico está ativo em relação ao pathname atual do navegador.
 *
 * @param currentPathname Pathname atual retornado por usePathname()
 * @param targetPath Caminho de destino canônico (ex: "/", "/pacientes", "/nutre/pacientes")
 * @param isSubdomain Se o contexto atual é subdomínio
 */
export function isNutrePathActive(
  currentPathname: string,
  targetPath: string,
  isSubdomain: boolean
): boolean {
  if (!currentPathname || !targetPath) return false;

  const normalizedCurrent = normalizeNutrePath(currentPathname);
  const normalizedTarget = normalizeNutrePath(targetPath);

  // Tratamento específico de raiz / dashboard
  if (normalizedTarget === "/" || normalizedTarget === "") {
    return normalizedCurrent === "/" || normalizedCurrent === "";
  }

  // Âncoras não definem página ativa
  if (normalizedTarget.startsWith("#")) {
    return false;
  }

  return (
    normalizedCurrent === normalizedTarget ||
    normalizedCurrent.startsWith(`${normalizedTarget}/`)
  );
}
