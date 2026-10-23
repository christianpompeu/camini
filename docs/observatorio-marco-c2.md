# Observatório — Sprint C2

Data do smoke test: 22/10/2026

Ambiente: Supabase HML `hrpathjcxyzzwxgkhwnt`

Modo: estritamente somente leitura

## Execução real

O `.env.local` foi carregado por um script Node com
`loadEnvConfig(process.cwd())`. A execução confirmou somente a presença, sem
imprimir valores, de:

- `OBSERVATORIO_NOTION_TOKEN`;
- `OBSERVATORIO_NOTION_DATA_SOURCE_ID`;
- `OBSERVATORIO_HML_SUPABASE_URL`;
- `OBSERVATORIO_HML_SUPABASE_SECRET_KEY`.

O smoke test chamou a interface pública `readEditorialQueue()` de
`lib/observatorio/editorial.ts`. A função executou `readNotionEditions()` e a
leitura de `public.observatorio_edicoes` em paralelo.

Resultado:

- Notion disponível: **sim**;
- Supabase HML disponível: **sim**;
- aviso retornado: `Notion conectado; reconciliação somente leitura.`;
- páginas mapeadas do Notion: **7**;
- registros em `observatorio_edicoes` no HML: **0**;
- escritas no Notion ou Supabase: **0**.

## Edições retornadas pelo Notion

| Identificador | Canal | Status | Revisão | Estado de reconciliação | URL |
|---|---|---|---|---|---|
| `2026-10-22-tech-1900-ampliada` | tech | Candidata (`candidata`) | Pendente (`pendente`) | `supabase_id_not_found` | [Notion](https://app.notion.com/p/Tech-22-10-2026-19h-Seguran-a-infraestrutura-e-auditoria-cient-fica-40113c241b4d812b905dd4bbb657f772) |
| `2026-10-22-panorama-0810-profunda` | panorama | Candidata (`candidata`) | Pendente (`pendente`) | `supabase_id_not_found` | [Notion](https://app.notion.com/p/Panorama-22-10-2026-08h10-Candidata-parcial-19-acontecimentos-40113c241b4d81e9a652e25678fd27d3) |
| `2026-10-21-tech-1900-ampliada` | tech | Candidata (`candidata`) | Pendente (`pendente`) | `supabase_id_not_found` | [Notion](https://app.notion.com/p/Tech-21-10-2026-19h-Pesquisa-ampliada-e-papers-40113c241b4d8119a325d2ce1baae326) |
| `2026-10-21-panorama-0900-ampliada` | panorama | Aprovada (`aprovada`) | Concluída (`concluida`) | `supabase_id_not_found` | [Notion](https://app.notion.com/p/Panorama-21-10-2026-09h-Apura-o-ampliada-19-pautas-40013c241b4d81b58650e72e70e0d32a) |
| `2026-10-20-tech-1900-ampliada` | tech | Candidata (`candidata`) | Pendente (`pendente`) | `supabase_id_not_found` | [Notion](https://app.notion.com/p/Tech-20-10-2026-19h-Pesquisa-ampliada-3ff13c241b4d817da71ad88c1ef06a39) |
| `2026-10-20-tech-inaugural` | tech | Candidata (`candidata`) | Pendente (`pendente`) | `supabase_id_not_found` | [Notion](https://app.notion.com/p/Tech-20-10-2026-Chips-PyTorch-e-agentes-de-IA-3ff13c241b4d81549bb4e7c7c07c1987) |
| `2026-10-20-panorama-inaugural` | panorama | Candidata (`candidata`) | Pendente (`pendente`) | `supabase_id_not_found` | [Notion](https://app.notion.com/p/Panorama-20-10-2026-Energia-elei-es-e-mercados-3ff13c241b4d8163b7b1e4033f755447) |

Todas as sete páginas possuem `Supabase ID` declarado, mas nenhum desses IDs
existe atualmente em `observatorio_edicoes`. Por isso, o estado correto é
`supabase_id_not_found`; nenhuma correspondência foi inferida por título ou
data e nenhum registro artificial foi criado.

## Rotas e autorização

Prova sem sessão, contra o servidor local real:

| Rota | Resultado |
|---|---|
| `/dashboard/observatorio` | HTTP `307` para `/login?next=%2Fdashboard%2Fobservatorio` |
| `/dashboard/observatorio/edicoes` | HTTP `307` para `/login?next=%2Fdashboard%2Fobservatorio%2Fedicoes` |

A camada interna também valida a identidade com `supabase.auth.getUser()` e
exige `is_super_admin=true` ou a rota `/dashboard/observatorio` em
`app_permissions`. Usuários que falham nessa checagem recebem
`ObservatorioAccessError`, convertido pelas páginas em `notFound()`.

A prova visual com sessão autorizada não foi concluída nesta execução: o
controlador do navegador falhou repetidamente com `native pipe unavailable`,
inclusive após reinicialização conforme o procedimento de recuperação. Não foi
criado usuário, token ou cookie artificial para contornar essa limitação.

## Parecer

A integração real **Notion → `readEditorialQueue()` → Supabase HML** está
operacional e reconciliou sete edições, sem qualquer escrita. A negativa sem
sessão também foi comprovada nas duas rotas.

Entretanto, a **Sprint C2 ainda não pode ser declarada encerrada** porque falta
a evidência solicitada de renderização das duas rotas com uma sessão realmente
autorizada e a negativa com uma sessão autenticada sem permissão. Assim que o
controlador do navegador estiver disponível (ou forem fornecidas sessões de
teste existentes), esse teste pode ser concluído sem alteração de código ou
dados.

Nenhuma alteração foi feita em produção, migrations, Radar, permissões
editoriais, Notion ou dados do Supabase.
