import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  // Preserva integralmente a autenticação, cookies e atualização de sessão Supabase SSR do Camini
  const response = await updateSession(request);

  // Verificação estrita do subdomínio nutre.camini.dev.br (permitindo portas em ambiente de teste)
  const host = request.headers.get("host") || "";
  const isNutreSubdomain = /^nutre\.camini\.dev\.br(:\d+)?$/i.test(host);

  if (isNutreSubdomain && response) {
    response.headers.set("x-nutre-subdomain", "true");
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
