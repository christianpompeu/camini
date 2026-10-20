# ANTIGRAVITY — Nutre, Marco Visual/Funcional do Cadastro e Temas

Atue como engenheiro frontend sênior em Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui e acessibilidade.

## Insumos

Este pacote contém 4 renders visuais mais `ESPECIFICACAO_UX_E_CORRECOES.md`. Leia **primeiro a especificação** e depois as imagens. As imagens são referências de aparência, **não** requisitos completos nem dados verdadeiros. Código existente no repositório GitHub `christianpompeu/camini`, branch `nutre`, é o ponto de partida. Não reinicie o projeto. Inspecione `app/nutre/nutre.css`, `components/nutre/nutre-shell.tsx`, `components/nutre/nutre-sidebar.tsx`, `components/nutre/nutre-header.tsx`, rotas e contextos existentes, além de `app/globals.css` e `app/layout.tsx` para efeitos do tema global.

## Tarefas

1. Primeiro apresente diff esperado, riscos e plano de implementação, sem alterar produção nem outra branch.
2. Refine visual do cadastro e do perfil segundo as imagens, mas preserve tokens, tipografia existente (Plus Jakarta Sans/Geist), componentes reutilizáveis e acessibilidade. A nova **sidebar violeta escura** é proposta de design, sujeita a avaliação; preserve o menu funcional, sem botões inoperantes que pareçam ativos.
3. Implemente o cadastro React como fluxo real de **cinco etapas** na rota existente, com dados em memória somente e validação adequada a uma demonstração. Represente as etapas 2, 3 e 4 com base no contrato escrito (não há imagens finais). Não use HTML/JS exportado do Stitch como fonte de implementação.
4. Crie estado de revisão com edição e informações derivadas dos inputs; conclusão explicitamente simulada; encaminhe para perfil demonstrativo com dados consistentes. Não grave nem aceite dados reais de pacientes em backend. Não apresente mensagens de sucesso de persistência.
5. Projete CSS com tokens semânticos exclusivos do Nutre para **Claro, Escuro e Sistema**. Sidebar escura em ambos os temas, ajustando luminosidade/contraste. O estado e preferência do Nutre devem ser independentes do FORÇA: não usar `forca-theme` para decidir cores do Nutre, nem sobrescrever o modo global do Camini, nem introduzir hydrate mismatch. Preservar a lógica global já existente, encapsulando as substituições no `.nutre-theme` e atributo local de tema.
6. Remova conteúdo demonstrativo enganoso: número CRN inventado, dados fictícios acionáveis, idade errada, objetivo contraditório, plano alimentar inexistente, alegações LGPD/criptografia/sincronização, IA Body Scan tratada como funcional. Tudo coerente com fixture único.
7. Implemente responsividade com verificações desktop 1440px e mobile 390px, incluindo barra lateral móvel, stepper e revisão.
8. Teste navegação no hostname `nutre.camini.dev.br` e também `/nutre` no domínio principal, sem mudar rewrites, DNS, proxy ou Supabase. Valide `npm run build`, lint nos arquivos alterados, acessibilidade básica, interações e ausência de regressão de Camini/FORÇA/Radar.
9. Entregue relatório de arquivos alterados, estados verificáveis, testes, lacunas da homologação e comparativos claros/escuros. Aguarde autorização para push/deploy ou banco de dados se isso não for expressamente solicitado.

## Fora de escopo

Nenhuma conexão Supabase Nutre, autenticação clínica, gravação real de dados sensíveis, agenda, atendimento, anamnese, antropometria, bioquímica, prescrição, IA clínica, WhatsApp real, PDF ou portal de pacientes neste marco. Não transformar capturas originais do DietSystem em uploads ou fixtures.

## Gates

Apenas marcar o marco aprovado após revisão visual humana e posterior validação de campos obrigatórios e regras de negócio com Camila. Se algum detalhe das imagens conflitar com a especificação, prevalece a especificação; se conflitar com algo ainda não aprovado, apresente opção e sinalize pendência.
