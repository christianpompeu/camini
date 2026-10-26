# Dicionário de Dados TOTVS RM — Componentes & Módulo

Este diretório contém os componentes React e UI que compõem a rota pública `/dicionario-rm` do Camini.

A documentação detalhada de arquitetura e funcionalidades completas está disponível em:
👉 **[docs/dicionario-rm/README.md](../../docs/dicionario-rm/README.md)**

---

## Estrutura de Arquivos

* `dicionario-client.tsx`: Orquestrador de estado do cliente (split view, sessões ChatGPT-like, URL sync, pre-fetch em lote).
* `dicionario-sidebar.tsx`: Barra lateral com abas `Tabelas` e `Histórico`, campo de busca global, pills de módulos e largura ajustável por arrasto.
* `table-viewer-pane.tsx`: Painel de visualização de tabelas (grid de campos, tipos, filtros internos, abas SQL e FKs).
* `table-relation-graph.tsx`: Grafo interativo em rede desenvolvido em Canvas HTML5 com física elástica.
* `common-columns-bar.tsx`: Comparador inteligente de colunas comuns em visualização lado a lado.
* `dicionario-empty-state.tsx`: Estado inicial/vazio com acesso rápido a tabelas e módulos populares.
* `types.ts`: Tipos TypeScript específicos do dicionário (sessões, abas, cache e módulos).
