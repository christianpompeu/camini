const http = require("http");

const BASE_URL = "http://localhost:3000";

function testRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      BASE_URL + options.path,
      {
        method: options.method || "GET",
        headers: {
          Host: options.host,
          ...(options.headers || {}),
        },
      },
      (res) => {
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
  });
}

async function runTests() {
  console.log("=================================================");
  console.log("NUTRE - MARCO 02: SUITE DE TESTES DE ROTEAMENTO");
  console.log("=================================================\n");

  const tests = [
    {
      name: "1. Subdomínio Raiz -> Nutre Dashboard",
      host: "nutre.camini.dev.br",
      path: "/",
      expectedStatus: 200,
      validate: (res) =>
        res.headers["x-nutre-subdomain"] === "true" &&
        (res.body.includes("Dra. Camila Pompeu") || res.body.includes("Gestão Nutricional")),
    },
    {
      name: "2. Subdomínio /pacientes -> Lista de Pacientes",
      host: "nutre.camini.dev.br",
      path: "/pacientes",
      expectedStatus: 200,
      validate: (res) =>
        res.body.includes("Beatriz Nogueira") ||
        res.body.includes("Gestão Clínica de Prontuários"),
    },
    {
      name: "3. Subdomínio /pacientes/novo -> Cadastro Guiado",
      host: "nutre.camini.dev.br",
      path: "/pacientes/novo",
      expectedStatus: 200,
      validate: (res) =>
        res.body.includes("Cadastrar Novo Paciente") || res.body.includes("ETAPA 1 DE 4"),
    },
    {
      name: "4. Subdomínio /pacientes/[id] -> Perfil Individual",
      host: "nutre.camini.dev.br",
      path: "/pacientes/beatriz-nogueira",
      expectedStatus: 200,
      validate: (res) =>
        res.body.includes("Beatriz Nogueira") && res.body.includes("NUT-2024-089"),
    },
    {
      name: "5. Preservação de Query Strings -> /pacientes?search=beatriz",
      host: "nutre.camini.dev.br",
      path: "/pacientes?search=beatriz",
      expectedStatus: 200,
      validate: (res) => res.statusCode === 200,
    },
    {
      name: "6. Prevenção de URL Suja -> /nutre redireciona para /",
      host: "nutre.camini.dev.br",
      path: "/nutre",
      expectedStatus: 307,
      validate: (res) => res.headers["location"] === "/",
    },
    {
      name: "7. Prevenção de Rewrite Duplo -> /nutre/pacientes redireciona para /pacientes",
      host: "nutre.camini.dev.br",
      path: "/nutre/pacientes",
      expectedStatus: 307,
      validate: (res) => res.headers["location"] === "/pacientes",
    },
    {
      name: "8. URL Desconhecida no Subdomínio -> Retorna 404",
      host: "nutre.camini.dev.br",
      path: "/rota-inexistente-12345",
      expectedStatus: 404,
      validate: (res) => res.statusCode === 404,
    },
    {
      name: "9. Domínio Principal / -> Camini Hub (Preservado)",
      host: "camini.dev.br",
      path: "/",
      expectedStatus: 200,
      validate: (res) =>
        res.body.includes("Camini") &&
        (res.body.includes("Radar Tributário") || res.body.includes("Hub Integrado")),
    },
    {
      name: "10. Domínio Principal /nutre -> Nutre Dashboard no Hub",
      host: "camini.dev.br",
      path: "/nutre",
      expectedStatus: 200,
      validate: (res) => res.body.includes("Dra. Camila Pompeu"),
    },
    {
      name: "11. Domínio Principal /nutre/pacientes -> Lista Nutre no Hub",
      host: "camini.dev.br",
      path: "/nutre/pacientes",
      expectedStatus: 200,
      validate: (res) => res.body.includes("Beatriz Nogueira"),
    },
    {
      name: "12. Domínio Principal /radar -> Módulo Público Preservado",
      host: "camini.dev.br",
      path: "/radar",
      expectedStatus: 200,
      validate: (res) => res.statusCode === 200,
    },
    {
      name: "13. Rota Protegida /dashboard -> Redirecionamento Supabase Auth",
      host: "camini.dev.br",
      path: "/dashboard",
      expectedStatus: 307,
      validate: (res) => {
        const loc = res.headers["location"] || "";
        return loc.includes("/login");
      },
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
