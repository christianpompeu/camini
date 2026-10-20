# Nutre — Contrato visual e de comportamento (v0.1, proposta)

## 1. Fontes de verdade e escopo

O repositório existente `christianpompeu/camini`, branch `nutre`, seu Next.js, roteamento por hostname, as definições `nutre-theme`, o `DESIGN.md` da prototipação e os registros de campos extraídos de telas de referência têm prioridade sobre detalhes inventados nas imagens. Não alterar Camini Hub, FORÇA, Radar ou autenticação Supabase existente.

Imagens = direção estética para quatro estados. NÃO são fonte confiável para dados clínicos, valores, campos obrigatórios, validações, credenciais, integrações, responsividade ou datas.

## 2. Identidade visual proposta

- Marca: Nutre; identidade clínica minimalista, cartões discretos e hierarquia clara.
- Violeta principal `#6846B5`; lilás `#B8A1E3`; lavanda `#F5F1FC`; texto grafite `#282433`; sucesso/sálvia `#93AA91`; alerta/âmbar `#DCA76B`.
- Tipografia **conforme design existente**: títulos Plus Jakarta Sans, corpo Geist. NÃO copiar a tipografia serifada que apareceu em alguns mockups, salvo aprovação expressa posterior.
- Sidebar: **proposta para validação:** fundo violeta muito escuro em ambos os temas, com tonalidade adaptada; reduzir peso do menu; priorizar Pacientes, Avaliação e Atendimentos. Não exibir promoções comerciais de IA/Body Scan nem prometer precisão clínica.
- Tema claro: canvas `#F5F1FC`, cartões brancos, linhas sutis, sidebar aprox. `#241B35`.
- Tema escuro: canvas aprox. `#1E1B26`, cartões aprox. `#2B2635`, sidebar aprox. `#16121E`, textos claros, realces lilás. Cores são **propostas a validar por contraste**, não tokens finais já aprovados.
- Tokens semânticos isolados `.nutre-theme`/`data-nutre-theme` e variáveis como `--nutre-bg`, `--nutre-card`, `--nutre-sidebar-bg`, `--nutre-text`, `--nutre-muted`, `--nutre-border`, `--nutre-primary`, `--nutre-focus`, `--nutre-success`. Remover hardcodes de elementos que precisem reagir ao tema.
- Alternância **Claro / Escuro / Sistema**, preferência `nutre-theme` independente do `forca-theme` e da classe global `.dark` usada pelo Camini. Não introduzir flash/hydration mismatch.

## 3. Tela A: cadastro em cinco etapas (uma rota, cinco estados)

**Etapa 1 — Identificação e contatos**: nome, nome preferido, nascimento, sexo (nomenclatura clínica a validar), CPF, telefone, e-mail; responsável condicional (nome e CPF) quando aplicável. Adotar obrigatoriedades após validação profissional; quando houver CPF, aplicar máscara/validação se apropriado, não exibir check falso.

**Etapa 2 — Contexto e vínculo de atendimento**: objetivo, tratamento/protocolo/serviço eventualmente associado, tags, condições informadas e local de atendimento (seleção e estado vazio/criação contextual). Separar relato do paciente de diagnóstico confirmado e tratamento contratado.

**Etapa 3 — Complementares**: CEP, rua, número, complemento, bairro, cidade, UF, foto opcional e observações relevantes. **Não colocar anamnese, peso, IMC ou avaliação clínica completa dentro dessa etapa** sem aprovação da Camila.

**Etapa 4 — Preferências e serviços opcionais**: canais preferidos e autorizações específicas (não inferir consentimento LGPD genérico), serviços opcionais. Não misturar recibo/atestado como obrigação para concluir cadastro.

**Etapa 5 — Revisão**: resumo somente dos campos realmente coletados nas etapas 1–4, com editar/voltar sem perder estado. Não inventar profissão, estado civil, IMC, medicamentos, histórico alimentar ou contrato.

**Fluxo:** 1→2→3→4→5→confirmação demonstrativa→perfil recém-cadastrado. Campos reativos em React, validações básicas, preservação durante a navegação, estados de erro e passos alcançáveis; a conclusão NÃO salva um paciente real neste marco.

## 4. Tela B: confirmação do cadastro

Usar linguagem inequívoca: **“Fluxo demonstrativo concluído”** ou “Cadastro simulado concluído”. Não afirmar “dados registrados no banco” ou enviar mensagens/credenciais. Ações “Abrir perfil de demonstração”, “Novo cadastro”, “Voltar para pacientes”. Mostrar somente dados fornecidos no wizard; qualquer plano alimentar ainda não criado deve aparecer como “Não definido”.

## 5. Tela C: perfil inicial

Identificação e objetivo compartilhados com o wizard; dados coerentes (nome, nasc., contato, local); data demonstrativa consistente com a simulação. Nenhuma avaliação, prontuário, consulta, contrato, plano ou upload existente sem criação explícita. Cards de estado vazio e CTAs futuros devidamente sinalizados. Evitar botão “Compartilhar” ativo e WhatsApp acionável sem regra/serviço definido.

## 6. Erros nos renders a corrigir

- **Idade errada:** nasc. 14/05/1995 = 31 anos em 20/10/2026, NÃO 29. Preferir calcular em runtime ou esconder idade em mocks estáticos.
- **Objetivos conflitantes:** hipertrofia/rendimento vs emagrecimento/definição. Usar fixture único.
- **Plano inexistente aparecendo como criado:** “Modelo Híbrido” na confirmação; omitir.
- **Etapa 3 mal nomeada:** aparece “Dados clínicos e anamnese”; substituir por “Endereço, foto e observações”.
- **CRN, nome de profissional e contatos inventados:** jamais reproduzir como dados profissionais reais; usar “Profissional de demonstração”. CPF de aparência válida e números acionáveis devem ser substituídos por placeholders seguros.
- **Mensagens simulando LGPD, criptografia, envio ou sincronização:** remover afirmações não comprovadas.
- **Elementos comerciais/IA Body Scan:** remover ou reservar fora do fluxo central.
- **Fonte serifada nas imagens:** preferir tipografia definida no DESIGN.md e já codificada no Nutre.
- **Datas desatualizadas:** exemplo “Cadastrado em 24/10/2024” contradiz novo cadastro de 2026.
- **Salvamento falso:** sucesso só pode indicar simulação enquanto não houver backend.

## 7. Responsividade, usabilidade e estado

- Desktop 1440px e mobile 390px; sidebar vira drawer acessível; o resumo lateral ocupa toda a largura/é recolhível; stepper compacto com título da etapa atual; botões persistentes sem sobreposição.
- Inputs com rótulos, erros vinculados, foco visível, teclado, semântica e contraste WCAG AA para texto essencial.
- Estados: vazio, preenchido, inválido, carregando (se houver operação real), demonstrativo concluído; não fingir sucesso de API inexistente.
- Ações de editar devem preservar dados já digitados. Sem dados sensíveis de pacientes reais na versão pública.

## 8. Escopo futuro não esquecido

Avaliação Nutricional Parte A: central, anamnese, recordatório, restrições e editor de prontuário. Partes B/C: antropometria, avaliação bioquímica, plano alimentar, evolução, retorno/pós-consulta. Todos dependem da observação e homologação clínica da Camila. Não implementar fórmulas, IA ou integração clínica nesse marco.

## 9. Critério de aceite deste pacote

Comparação visual com as quatro imagens; cinco estados do wizard realmente funcionais; resumo/confirmacão/perfil coerentes com fixture único; nenhuma divulgação de dados ou capacidade não implementada; tema independente e responsivo; testes/build e diffs de não regressão no Camini.
