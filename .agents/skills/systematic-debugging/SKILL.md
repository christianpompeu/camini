---
name: systematic-debugging
description: Metodologia rigorosa de 4 passos para encontrar a causa raiz de bugs complexos.
---
# Systematic Debugging Methodology

Ao debugar um problema complexo, pare, não adivinhe, e aplique estritamente os seguintes 4 passos. Documente o seu processo para o usuário.

1.  **Reproduzir e Observar (Isolate)**
    -   Confirme como reproduzir o bug e em qual ambiente ele ocorre.
    -   Observe os sintomas precisos: logs de erro, códigos de status, falhas visuais. Qual é o estado esperado vs atual?
2.  **Formular Hipóteses (Hypothesize)**
    -   Baseado nos sintomas e no fluxo de código, liste 2 a 3 possíveis causas raiz. Não assuma nada sem prova. Exemplo: "O ID pode estar null devido a um erro de parsing", ou "A query RLS está filtrando o registro".
3.  **Coletar Evidências (Test)**
    -   Proponha e execute testes cirúrgicos para provar ou refutar cada hipótese.
    -   Adicione `console.log`, injete breakpoints, ou inspecione o banco/estado antes de reescrever a lógica inteira. Verifique os dados no início e fim das funções suspeitas.
4.  **Aplicar Correção Focada e Validar (Fix & Verify)**
    -   Aplique a menor mudança de código possível que resolve o problema.
    -   Valide não apenas que o problema parou de ocorrer, mas que nenhum efeito colateral indesejado foi introduzido (ex: corrigiu um bug mas quebrou outro estado).
