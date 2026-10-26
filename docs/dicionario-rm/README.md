# Dicionário de Dados TOTVS RM — Camini

Aplicação pública, interativa e semântica para consulta, exploração e descoberta de relações entre mais de **9.600 tabelas** do ecossistema TOTVS RM.

---

## 🎯 Objetivo & Visão Geral

O **Dicionário de Dados TOTVS RM** (`/dicionario-rm`) é uma plataforma dedicada a desenvolvedores, analistas de dados, DBAs e consultores de ERP para desmistificar o schema do TOTVS RM. A rota é **100% pública** (isenta de login no middleware) e segue a identidade visual minimalista em preto e branco do Camini, combinando alta densidade de informação com UX fluida.

---

## 🚀 Resumo das Funcionalidades Disponíveis

### 1. Catálogo Completo & Busca Multifacetada
* **Base de +9.600 Tabelas**: Catálogo unificado com sistema, descrição oficial e estrutura de campos de todos os módulos TOTVS RM.
* **Busca Global em Tempo Real (Omnisearch)**:
  * **Por Nome da Tabela**: Match exato e por prefixo/inclusão (ex: `TMOV`, `FLAN`, `FCFO`).
  * **Por Descrição da Tabela**: Pesquisa termos funcionais de negócio (ex: "movimento de estoque", "lançamento financeiro").
  * **Por Nome de Coluna / Campo**: Permite digitar qualquer campo (ex: `CODFILIAL`, `NSEQITMMOV`, `CHAPA`, `VALORBRUTO`) e encontrar imediatamente todas as tabelas do ERP que possuem aquela coluna.
  * **Por Descrição de Campo**: Busca por texto descritivo dos campos (ex: "código da filial", "valor líquido", "data de emissão").
* **Identificação Visual do Match**: Resultados de busca destacam com badge próprio (`↳ Campo: COD...`) a coluna encontrada quando o match ocorre em um campo.
* **Ordenação Inteligente de Catálogo**: Ao abrir ou limpar a busca, o sistema prioriza automaticamente as tabelas centrais do RM (`TMOV`, `FLAN`, `FCFO`, `PFUNC`, `GCOLIGADA`, `TITMMOV`, `GCCUSTO`, `TCPG`, `CPARAM`, `MPATRIMONIO`, `KORDEM`...), seguidas por todas as 9.600+ tabelas em ordem alfabética limpa.
* **Filtros Rápidos por Módulo RM**: Seletores em pills horizontais para focar rapidamente em módulos como `RM Fluxus (F)`, `RM Nucleus (T)`, `RM Labore (P)`, `RM Saldus (C)`, `Global (G)`, etc.

---

### 2. Sidebar Inteligente com Abas & Histórico (Estilo ChatGPT)
* **Dois Modos de Visualização**:
  * **Modo Expandido**: Com separadores claros, rolagem independente e largura redimensionável por clique e arraste (entre 260px e 500px, salva no `localStorage`).
  * **Modo Minimizado (Rail Estreito com Ícones)**: Recolhimento elegante com atalhos de ícone para Nova Pesquisa, Busca, Histórico, Módulos e salto para o RM SQL AI.
* **Aba "Tabelas"**: Mantém a listagem do catálogo sempre acessível, com contador de tabelas, indicação de tabela ativa/ao lado e botão "Carregar mais tabelas" sob demanda.
* **Aba "Histórico"**: Sessões de exploração salvas localmente e agrupadas no tempo (*Fixados*, *Hoje*, *Ontem*, *Últimos 7 dias*, *Mais antigos*), com ações para renomear, fixar (pin) e excluir sessões.
* **Botão `+ Nova`**: Inicia uma consulta limpa preservando o histórico de consultas anteriores.

---

### 3. Painel de Inspeção Detalhada da Tabela (`TableViewerPane`)
* **Cabeçalho com Métricas**:
  * Código da tabela com botão de cópia com 1 clique.
  * Tag do Módulo TOTVS RM correspondente.
  * Descrição oficial em português.
  * Métricas resumidas: total de colunas, chaves primárias (PK), chaves estrangeiras (FK), conexões de saída e conexões de entrada.
* **Filtro Interno de Colunas**:
  * Input de busca específico para a tabela ativa.
  * Filtros por tipo de dado: `Todas`, `Chaves (PK/FK)`, `Texto`, `Números` e `Datas`.
* **Grid de Metadados e Chaves**:
  * Ícones para identificação de chave primária (`PK` dourada) e chave estrangeira (`FK`).
  * Botões de salto direto (`➔ TABELA`) para relacionamentos conhecidos e heurísticos.
  * Tipos de dados nativos do SQL Server (ex: `smallint`, `varchar(15)`, `decimal(15,4)`, `datetime`).
  * Descrição funcional de cada coluna.

---

### 4. Grafo Interativo de Relacionamentos (`TableRelationGraph`)
* **Visualização em Rede (Canvas HTML5)**:
  * Tabela ativa centralizada em destaque com seus campos primários.
  * Conexões direcionadas com setas e rótulos das cláusulas de junção (`ON campoA = campoB`).
  * Cores semânticas de conexão:
    * 🟢 **Verde**: Chaves Primárias / Origem.
    * 🟣 **Lilás / Roxo**: Relacionamentos de Saída (Outgoing FKs).
    * 🔵 **Azul**: Relacionamentos de Entrada (Incoming FKs / Dependentes).
* **Física e Controles Interativos**:
  * Clique e arraste de nós com física elástica.
  * Zoom suave pela roda do mouse e pan (arrastar o fundo).
  * Seletor de profundidade de visualização (1 ou 2 níveis).
  * Clique nos nós para navegar diretamente ou abrir ao lado para comparação.

---

### 5. Modo Lado a Lado (Split View) com Gestão de Abas
* **Comparação Simultânea**: Permite analisar duas ou mais tabelas lado a lado na mesma tela sem perder o foco da tabela principal.
* **Gestão Múltipla de Tabelas Abertas ao Lado**:
  * Clicar em `[ ] Abrir ao Lado ->` em qualquer FK (de entrada ou de saída) adiciona a tabela como uma **nova aba** na coluna da direita.
  * É possível manter abertas simultaneamente várias tabelas (ex: `CPDIARIOPTG`, `TITMMOV`, `FCFO`), alternando entre elas com 1 clique.
  * Aba fixa para alternar entre o **Grafo de Relacionamentos** e as tabelas abertas.
  * Fechamento individual de abas (`✕`), botão `Limpar lista` para fechar todas e botão `+ Nova` para adicionar qualquer tabela à lateral.
* **Comparador Inteligente de Colunas (`CommonColumnsBar`)**:
  * Barra superior dinâmica que compara os campos da tabela primária com a aba ativa na lateral, destacando colunas homônimas e possíveis chaves de ligação.
* **Ações de Janela**:
  * Inversão rápida de posições (Swap ⟷).
  * Maximizar para tela cheia.
  * Fechar coluna lateral para retornar ao painel único.

---

### 6. Relacionamentos Bidirecionais & Gerador de Scripts SQL
* **FKs de Saída (Outgoing)**: Mapeia todas as tabelas referenciadas pela tabela atual, com os campos de ligação e botão para cópia.
* **FKs de Entrada (Incoming)**: Identifica todas as tabelas do ecossistema RM que apontam para a tabela atual (ex: 168 conexões de entrada apontando para `TMOV`).
* **Aba `</> SQL T-SQL`**: Gera automaticamente scripts prontos para cópia com `SELECT`, `FROM` e todos os `LEFT JOIN` sugeridos estruturados para uso no SQL Server Management Studio (SSMS), DBeaver ou ferramentas de BI (Power BI, Metabase).

---

### 7. Deep Linking & Integração com Ecossistema Camini
* **URLs com Estado Completo**: A barra de endereços reflete o estado da navegação:
  * `?table=TMOV`: abre a tabela principal.
  * `&split=CPDIARIOPTG,TITMMOV`: restaura as tabelas abertas ao lado.
  * `&activeSide=CPDIARIOPTG`: seleciona a aba ativa da lateral.
  * `&graph=true`: ativa o modo grafo.
* **Botão "Compartilhar"**: Copia o link direto com todos os parâmetros ativos para a área de transferência.
* **Botão "Perguntar no RM SQL AI"**: Integração nativa com o assistente inteligente de SQL do Camini, pré-carregando o contexto das tabelas ativas para geração assistida de queries e relatórios.

---

## 📂 Arquitetura do Código

```
├── app/
│   ├── dicionario-rm/
│   │   └── page.tsx                     # Página pública Next.js App Router (RSC + SEO)
│   └── api/
│       └── totvs-rm/
│           └── tables/route.ts          # API REST otimizada para catálogo, busca e detalhes
├── components/
│   └── dicionario-rm/
│       ├── dicionario-client.tsx        # Orquestrador de estado global (split view, sessões, URLs)
│       ├── dicionario-sidebar.tsx       # Sidebar com abas Tabelas/Histórico, busca e drag-resize
│       ├── table-viewer-pane.tsx        # Grid de campos, tipos, filtros e abas SQL/FKs
│       ├── table-relation-graph.tsx     # Grafo visual em rede (Canvas HTML5 com física)
│       ├── common-columns-bar.tsx       # Comparador de colunas homônimas entre tabelas
│       ├── dicionario-empty-state.tsx   # Tela de boas-vindas com cards e atalhos rápidos
│       └── types.ts                     # Definições de tipos TypeScript do dicionário
├── lib/
│   └── totvs-rm/
│       ├── schema-engine.ts             # Motor de busca semântica, ranking e cálculo de FKs
│       └── data/
│           └── DicionarioSemantico_Completo.json # Base JSON enriquecida do TOTVS RM
└── docs/
    └── dicionario-rm/
        └── README.md                    # Esta documentação
```

---

## 🧪 Verificação & Testes

Para rodar a suíte de testes automatizados do Dicionário RM:

```bash
npm run test:dicionario-rm
```

Para verificar tipagem TypeScript:

```bash
cmd /c npx tsc --noEmit
```
