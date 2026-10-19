const http = require("http");

const BASE_URL = "http://localhost:3000";

function testRequest(options) {
  return new Promise((resolve, reject) => {
    const doReq = (currentPath) => {
      const req = http.request(
        BASE_URL + currentPath,
        {
          method: options.method || "GET",
          headers: {
            Host: options.host,
            ...(options.headers || {}),
          },
        },
        (res) => {
          if (
            options.followRedirect &&
            (res.statusCode === 301 ||
              res.statusCode === 302 ||
              res.statusCode === 307 ||
              res.statusCode === 308)
          ) {
            const loc = res.headers["location"];
            if (loc && loc.startsWith("/")) {
              return doReq(loc);
            }
          }
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body,
            });
          });
        }
      );
      req.on("error", reject);
      req.end();
    };
    doReq(options.path);
  });
}

async function runTests() {
  console.log("=================================================");
  console.log("NUTRE - MARCO 02.1: SUITE DE HARDENING E TESTES");
  console.log("=================================================\n");

  const tests = [
    // --- 13 TESTES ORIGINAIS PRESERVADOS ---
    {
      id: 1,
      name: "1. Subdomínio Raiz -> Nutre Dashboard",
      host: "nutre.camini.dev.br",
      path: "/",
      expectedStatus: 200,
      validate: (res) =>
        res.headers["x-nutre-subdomain"] === "true" &&
        (res.body.includes("Dra. Camila Pompeu") || res.body.includes("Gestão Nutricional")),
    },
    {
      id: 2,
      name: "2. Subdomínio /pacientes -> Lista de Pacientes",
      host: "nutre.camini.dev.br",
      path: "/pacientes",
      expectedStatus: 200,
      validate: (res) =>
        res.body.includes("Beatriz Nogueira") ||
        res.body.includes("Gestão Clínica de Prontuários"),
    },
    {
      id: 3,
      name: "3. Subdomínio /pacientes/novo -> Cadastro Guiado",
      host: "nutre.camini.dev.br",
      path: "/pacientes/novo",
      expectedStatus: 200,
      validate: (res) =>
        res.body.includes("Cadastrar Novo Paciente") || res.body.includes("ETAPA 1 DE 4"),
    },
    {
      id: 4,
      name: "4. Subdomínio /pacientes/[id] -> Perfil Individual",
      host: "nutre.camini.dev.br",
      path: "/pacientes/beatriz-nogueira",
      expectedStatus: 200,
      validate: (res) =>
        res.body.includes("Beatriz Nogueira") && res.body.includes("NUT-2024-089"),
    },
    {
      id: 5,
      name: "5. Preservação de Query Strings -> /pacientes?search=beatriz",
      host: "nutre.camini.dev.br",
      path: "/pacientes?search=beatriz",
      expectedStatus: 200,
      validate: (res) => res.statusCode === 200,
    },
    {
      id: 6,
      name: "6. Prevenção de URL Suja -> /nutre redireciona para /",
      host: "nutre.camini.dev.br",
      path: "/nutre",
      expectedStatus: 307,
      validate: (res) => res.headers["location"] === "/",
    },
    {
      id: 7,
      name: "7. Prevenção de Rewrite Duplo -> /nutre/pacientes redireciona para /pacientes",
      host: "nutre.camini.dev.br",
      path: "/nutre/pacientes",
      expectedStatus: 307,
      validate: (res) => res.headers["location"] === "/pacientes",
    },
    {
      id: 8,
      name: "8. URL Desconhecida no Subdomínio -> Retorna 404",
      host: "nutre.camini.dev.br",
      path: "/rota-inexistente-12345",
      expectedStatus: 404,
      validate: (res) => res.statusCode === 404,
    },
    {
      id: 9,
      name: "9. Domínio Principal / -> Camini Hub (Preservado)",
      host: "camini.dev.br",
      path: "/",
      expectedStatus: 200,
      validate: (res) =>
        res.body.includes("Camini") &&
        (res.body.includes("Radar Tributário") || res.body.includes("Hub Integrado")),
    },
    {
      id: 10,
      name: "10. Domínio Principal /nutre -> Nutre Dashboard no Hub",
      host: "camini.dev.br",
      path: "/nutre",
      expectedStatus: 200,
      validate: (res) => res.body.includes("Dra. Camila Pompeu"),
    },
    {
      id: 11,
      name: "11. Domínio Principal /nutre/pacientes -> Lista Nutre no Hub",
      host: "camini.dev.br",
      path: "/nutre/pacientes",
      expectedStatus: 200,
      validate: (res) => res.body.includes("Beatriz Nogueira"),
    },
    {
      id: 12,
      name: "12. Domínio Principal /radar -> Módulo Público Preservado",
      host: "camini.dev.br",
      path: "/radar",
      expectedStatus: 200,
      validate: (res) => res.statusCode === 200,
    },
    {
      id: 13,
      name: "13. Rota Protegida /dashboard -> Redirecionamento Supabase Auth",
      host: "camini.dev.br",
      path: "/dashboard",
      expectedStatus: 307,
      validate: (res) => {
        const loc = res.headers["location"] || "";
        return loc.includes("/login");
      },
    },

    // --- NOVOS TESTES DE HARDENING MARCO 02.1 ---
    {
      id: 14,
      name: "14. Hardening: Bloqueio de /radar no Subdomínio Nutre -> Retorna 404",
      host: "nutre.camini.dev.br",
      path: "/radar",
      expectedStatus: 404,
      validate: (res) => res.statusCode === 404,
    },
    {
      id: 15,
      name: "15. Hardening: Bloqueio de /forca no Subdomínio Nutre -> Retorna 404",
      host: "nutre.camini.dev.br",
      path: "/forca",
      expectedStatus: 404,
      validate: (res) => res.statusCode === 404,
    },
    {
      id: 16,
      name: "16. Hardening: Bloqueio de /dashboard no Subdomínio Nutre -> Retorna 404",
      host: "nutre.camini.dev.br",
      path: "/dashboard",
      expectedStatus: 404,
      validate: (res) => res.statusCode === 404,
    },
    {
      id: 17,
      name: "17. Hardening: Bloqueio de /api/* no Subdomínio Nutre -> Retorna 404 JSON",
      host: "nutre.camini.dev.br",
      path: "/api/totvs-rm/tables",
      expectedStatus: 404,
      validate: (res) => {
        try {
          const json = JSON.parse(res.body);
          return res.statusCode === 404 && json.error === "Not Found";
        } catch {
          return res.statusCode === 404;
        }
      },
    },
    {
      id: 18,
      name: "18. Hardening: Bloqueio de /totvs-rm no Subdomínio Nutre -> Retorna 404",
      host: "nutre.camini.dev.br",
      path: "/totvs-rm",
      expectedStatus: 404,
      validate: (res) => res.statusCode === 404,
    },
    {
      id: 19,
      name: "19. Hardening: Spoofing Header x-nutre-subdomain no Domínio Principal -> Não Afeta SSR",
      host: "camini.dev.br",
      path: "/nutre",
      headers: {
        "x-nutre-subdomain": "true",
      },
      expectedStatus: 200,
      validate: (res) => {
        // O header na resposta NÃO deve ser true e os links devem ser /nutre/pacientes (modo Hub)
        const headerNotLeaked = res.headers["x-nutre-subdomain"] !== "true";
        const rendersMainDomainLinks =
          res.body.includes('href="/nutre/pacientes"') ||
          res.body.includes('href=\\"/nutre/pacientes\\"');
        return headerNotLeaked && rendersMainDomainLinks;
      },
    },
    {
      id: 20,
      name: "20. Hardening: Preservação de Recursos Técnicos Next.js (Favicon)",
      host: "nutre.camini.dev.br",
      path: "/favicon.ico",
      expectedStatus: 200,
      validate: (res) => res.statusCode === 200,
    },
    {
      id: 21,
      name: "21. Hardening: Preservação de Prefetch / RSC no Subdomínio Nutre",
      host: "nutre.camini.dev.br",
      path: "/pacientes",
      headers: {
        RSC: "1",
      },
      followRedirect: true,
      expectedStatus: 200,
      validate: (res) => res.statusCode === 200,
    },
    {
      id: 22,
      name: "22. Hardening: Preservação de API Protegida no Camini -> 401 Unauthorized",
      host: "camini.dev.br",
      path: "/api/totvs-rm/tables",
      expectedStatus: 401,
      validate: (res) => res.statusCode === 401,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      const res = await testRequest(t);
      const statusOk = res.statusCode === t.expectedStatus;
      const customOk = t.validate ? t.validate(res) : true;

      if (statusOk && customOk) {
        console.log(`[PASS] ${t.name}`);
        passed++;
      } else {
        console.error(`[FAIL] ${t.name}`);
        console.error(`       Esperado: status ${t.expectedStatus}`);
        console.error(`       Recebido: status ${res.statusCode}, headers:`, res.headers);
        if (res.body && res.body.length < 500) {
          console.error(`       Body:`, res.body);
        }
        failed++;
      }
    } catch (err) {
      console.error(`[ERROR] ${t.name}:`, err.message);
      failed++;
    }
  }

  console.log("\n-------------------------------------------------");
  console.log(`Total: ${tests.length} | Passaram: ${passed} | Falharam: ${failed}`);
  console.log("-------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
