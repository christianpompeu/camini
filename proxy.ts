import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import { isNutreHost, isAllowedNutreSubdomainPath } from "./lib/nutre/navigation";

export async function proxy(request: NextRequest) {
  // Identificação confiável do hostname exclusivamente a partir de headers de host legítimos
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    request.nextUrl.host ||
    "";
  const isNutreSubdomain = isNutreHost(host);
  const pathname = request.nextUrl.pathname;

  // Política estrita de isolamento para nutre.camini.dev.br:
  // O subdomínio serve apenas rotas do Nutre e recursos técnicos necessários do Next.js
  if (isNutreSubdomain && !isAllowedNutreSubdomainPath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Not Found", message: "Rota de API indisponível neste subdomínio." },
        { status: 404 }
      );
    }

    const notFoundUrl = request.nextUrl.clone();
    notFoundUrl.pathname = "/_not-found";
    return NextResponse.rewrite(notFoundUrl, { status: 404 });
  }

  // Preserva integralmente a autenticação, cookies e atualização de sessão Supabase SSR do Camini
  const response = await updateSession(request);

  if (isNutreSubdomain && response) {
    // Marcação informativa apenas na resposta legítima do subdomínio
    response.headers.set("x-nutre-subdomain", "true");
  } else if (response) {
    // Remove qualquer tentativa de spoofing de cabeçalho pelo cliente no domínio principal
    response.headers.delete("x-nutre-subdomain");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2|woff|ttf)$).*)",
  ],
};
