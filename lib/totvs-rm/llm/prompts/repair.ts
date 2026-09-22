export interface VerifyProblem {
  code: string;
  message: string;
}

/**
 * Adendo de reparo: anexado ao system prompt na 2ª tentativa, com o
 * diagnóstico do verificador + SQL rejeitado.
 */
export function buildRepairAddendum(problems: VerifyProblem[], rejectedSql: string, allowedTables: string[]): string {
  return `\n\nREPARO OBRIGATÓRIO — sua resposta anterior foi rejeitada pela verificação automática do dicionário RM:\n${problems.map((p) => `- [${p.code}] ${p.message}`).join("\n")}\n\nSQL rejeitado (não repita estes erros):\n\`\`\`sql\n${rejectedSql.slice(0, 4000)}\n\`\`\`\n\nTabelas permitidas nesta consulta: ${allowedTables.join(", ")}. Gere novamente o JSON completo corrigindo TODOS os itens acima.`;
}
