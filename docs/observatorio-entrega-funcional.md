# Observatorio - entrega funcional

## Fluxo editorial

O painel privado usa `assertObservatorioAccess()` antes de ler ou mutar dados. A decisao humana chama `observatorio_decidir_edicao(jsonb)`. A publicacao chama a RPC separada `observatorio_publicar_edicao(jsonb)`, exige estado `aprovada`, versao/hash atuais, allowlist ativa e chave de idempotencia propria.

`Aprovar e publicar` executa as duas RPCs em sequencia. A aprovacao continua auditada se a publicacao falhar; a interface informa esse resultado sem mascarar a operacao parcial. Depois da publicacao, o painel revalida a fila, o detalhe e as rotas publicas do canal, e confirma a edicao por uma consulta publica direta antes de apresentar sucesso.

A migration proposta e `20261024100000_observatorio_publicacao_editorial.sql`. Ela cria somente a auditoria append-only de publicacao e a RPC correspondente. Nao foi aplicada remotamente.

## Roteiro operacional da primeira publicacao HML

O dashboard preserva a sessao principal Camini para autorizar o acesso privado. Dentro dele, o card `Revisao editorial HML` mantem uma segunda sessao Supabase Auth, criada com `NEXT_PUBLIC_OBSERVATORIO_HML_SUPABASE_URL` e `NEXT_PUBLIC_OBSERVATORIO_HML_SUPABASE_ANON_KEY`. A chave secreta HML nunca vai para o navegador.

1. Configure as duas variaveis publicas HML no deploy e mantenha `OBSERVATORIO_HML_SUPABASE_SECRET_KEY` somente no servidor.
2. Aplique, nesta ordem, `20261023150000_observatorio_c4_gate2_decisao_editorial.sql` e `20261024100000_observatorio_publicacao_editorial.sql`. A C3 historica nao deve ser reaplicada.
3. Crie ou confirme administrativamente o usuario Auth HML e a linha ativa em `observatorio_revisores_edicoes`. Esta etapa nao e feita pelo app.
4. Entre no Camini com a sessao principal autorizada, abra uma edicao candidata e conecte a revisao editorial com o e-mail e senha HML.
5. O servidor valida o access token diretamente no Auth HML e consulta a allowlist HML antes de cada RPC. JWT Camini e `service_role` nao sao usados como identidade humana.
6. Execute aprovar/rejeitar ou aprovar e publicar. As chaves de idempotencia permanecem estaveis entre re-renderizacoes e retries da mesma pagina.
7. Para publicar, a RPC registra a publicacao; o servidor consulta imediatamente a edicao publica no HML. Somente apos essa consulta retornar uma edicao elegivel o resultado e apresentado como sucesso.
8. Abra o link publico e confirme a edicao no arquivo do canal, preservando as contagens e os registros de auditoria.

Estados visiveis da sessao editorial: desconectada, conectando, autenticada e autorizada, autenticada sem permissao e expirada. Falhas posteriores a gravacao da publicacao sao exibidas como falha de verificacao publica, nao como publicacao confirmada.

## Dashboard de inteligencia

As rotas privadas sao:

- `/dashboard/observatorio`: visao geral, metricas, filtros e linha do tempo;
- `/dashboard/observatorio/noticias`: acontecimentos e materias;
- `/dashboard/observatorio/grafo`: nos, arestas e painel de contexto;
- `/dashboard/observatorio/tendencias`: tendencias persistidas ou estado vazio honesto.

O dashboard le rodadas, fontes, materias, acontecimentos, vinculos materia-acontecimento, relacoes, evidencias, tendencias e vinculos tendencia-acontecimento do HML server-side. Filtros combinaveis cobrem busca, categoria, fonte, tipo de relacao, status de evidencia e revisao.

O grafo nao cria causalidade: `causal_comprovada`, `correlacionado`, `hipotese`, `contestado` e demais estados sao exibidos conforme persistidos. A lista de nos e a alternativa acessivel ao SVG interativo. Cada materia mantem o link da fonte original.

As seis edicoes possuem `rodada_id` nullable no schema atual, mas o dashboard nao inventa vinculo entre edicao e acontecimento. Qualquer futura ligacao precisa vir de proveniencia explicita, nao de proximidade temporal ou textual.
