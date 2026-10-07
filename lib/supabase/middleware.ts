import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

interface CachedRoutes {
  data: Array<{ route_path: string; is_public: boolean }>;
  timestamp: number;
}

let cachedPublicRoutes: CachedRoutes | null = null;
const CACHE_TTL_MS = 15_000; // 15 segundos de cache

export function invalidatePublicRoutesCache() {
  cachedPublicRoutes = null;
}

async function getPublicRoutes(supabase: ReturnType<typeof createServerClient>) {
  const now = Date.now();
  if (cachedPublicRoutes && now - cachedPublicRoutes.timestamp < CACHE_TTL_MS) {
    return cachedPublicRoutes.data;
  }

  try {
    const { data, error } = await supabase
      .from("public_routes")
      .select("route_path, is_public");

    if (!error && data) {
      cachedPublicRoutes = {
        data,
        timestamp: now,
      };
      return data;
    }
  } catch (err) {
    console.error("Erro ao buscar public_routes no middleware:", err);
  }

  return cachedPublicRoutes?.data || [];
}

function matchesRoute(pathname: string, routePath: string) {
  if (pathname === routePath) return true;
  if (pathname.startsWith(routePath + "/")) return true;
  return false;
}

// Rotas que são sempre públicas e não gerenciadas por restrição
const ALWAYS_PUBLIC_PREFIXES = ["/login", "/auth", "/radar"];

// Prefixos conhecidos de rotas protegidas por padrão do sistema
const PROTECTED_SYSTEM_PREFIXES = [
  "/dashboard",
  "/totvs-rm",
  "/forca",
  "/playground",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: NÃO FAÇA QUALQUER ACESSO AO BANCO OU CHAMADA ASSÍNCRONA ANTES DO getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Se o usuário já está logado e tenta acessar rotas de auth
  if (user && pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Rotas que são sempre públicas (home, login, auth, portal de consulta do radar)
  if (
    pathname === "/" ||
    ALWAYS_PUBLIC_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    )
  ) {
    return supabaseResponse;
  }

  // Verificar se a rota atual é uma rota gerenciada ou protegida
  const isProtectedCandidate =
    PROTECTED_SYSTEM_PREFIXES.some((prefix) =>
      pathname === prefix || pathname.startsWith(prefix + "/")
    ) || pathname.startsWith("/api/totvs-rm");

  if (isProtectedCandidate) {
    const publicRoutes = await getPublicRoutes(supabase);

    // Mapear rota de API para a rota correspondente de interface
    const checkPath = pathname.startsWith("/api/totvs-rm") ? "/totvs-rm" : pathname;

    // Buscar a regra mais específica correspondente ao caminho
    const matchingRule = publicRoutes
      .filter((r) => matchesRoute(checkPath, r.route_path))
      .sort((a, b) => b.route_path.length - a.route_path.length)[0];

    // Se houver regra explícita declarando como pública
    const isPublic = matchingRule ? matchingRule.is_public : false;

    if (!isPublic && !user) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Acesso não autorizado. Autenticação necessária." },
          { status: 401 }
        );
      }

      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
