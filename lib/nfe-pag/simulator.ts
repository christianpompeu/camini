import { DiagnosticItem } from "./types";

export interface SimulatorParams {
  model: "55" | "65";
  finNFe: "1" | "3" | "4";
  tPag: string;
  vNF: number;
  vPag: number;
  tpIntegra: "1" | "2";
  xPag: string;
}

export function isElectronicPayment(tPag: string): boolean {
  return ["03", "04", "10", "11", "12", "13", "15", "17", "18", "23", "24"].includes(tPag);
}

export function generatePagXmlSnippet(params: SimulatorParams): string {
  const { tPag, vNF, vPag, tpIntegra, xPag } = params;
  const isElectronic = isElectronicPayment(tPag);

  const lines: string[] = [];
  lines.push("<pag>");
  lines.push("  <detPag>");

  // Indicador de pagamento
  if (tPag === "91") {
    lines.push("    <indPag>1</indPag>");
  } else {
    lines.push("    <indPag>0</indPag>");
  }

  // Meio de pagamento
  lines.push(`    <tPag>${tPag}</tPag>`);

  // Descrição para 99
  if (tPag === "99") {
    lines.push(`    <xPag>${xPag || "Outros Meios"}</xPag>`);
  }

  // Valor do pagamento
  lines.push(`    <vPag>${vPag.toFixed(2)}</vPag>`);

  // Grupo card para meios eletrônicos
  if (isElectronic) {
    lines.push("    <card>");
    lines.push(`      <tpIntegra>${tpIntegra}</tpIntegra>`);
    if (tpIntegra === "1") {
      lines.push("      <CNPJ>01234567000189</CNPJ>");
      if (["03", "04"].includes(tPag)) {
        lines.push("      <tBand>01</tBand>");
      }
      lines.push("      <cAut>1234567890ABCDEF</cAut>");
    }
    lines.push("    </card>");
  }

  lines.push("  </detPag>");

  // Troco
  const troco = vPag - vNF;
  if (troco > 0) {
    lines.push(`  <vTroco>${troco.toFixed(2)}</vTroco>`);
  }

  lines.push("</pag>");
  return lines.join("\n");
}

export function runSefazDiagnostics(params: SimulatorParams): DiagnosticItem[] {
  const { model, finNFe, tPag, vNF, vPag, tpIntegra, xPag } = params;
  const isElectronic = isElectronicPayment(tPag);
  const troco = vPag - vNF;
  const logs: DiagnosticItem[] = [];

  // Regra 1: Devolução / Ajuste exige tPag=90
  if ((finNFe === "3" || finNFe === "4") && tPag !== "90") {
    logs.push({
      type: "error",
      code: "871 (YA02-04)",
      msg: "Rejeição: Nota de Devolução (finNFe=4) ou Ajuste (finNFe=3) exige tPag=90 (Sem Pagamento).",
    });
  } else if ((finNFe === "3" || finNFe === "4") && tPag === "90") {
    logs.push({
      type: "success",
      code: "OK (YA02-04)",
      msg: "Conforme: tPag=90 preenchido corretamente para finalidade sem fluxo financeiro.",
    });
  }

  // Regra 2: NFC-e modelo 65 proíbe Duplicata (14) e Sem Pagamento (90)
  if (model === "65" && tPag === "14") {
    logs.push({
      type: "error",
      code: "857 (YA02-10)",
      msg: "Rejeição na NFC-e: Duplicata Mercantil (tPag=14) é proibida no modelo 65.",
    });
  }
  if (model === "65" && tPag === "90") {
    logs.push({
      type: "error",
      code: "899 (YA02-40)",
      msg: "Rejeição na NFC-e: O código 90 (Sem Pagamento) não é aceito no varejo presencial.",
    });
  }

  // Regra 3: Regra do xPag (YA02a-10 e YA02a-20)
  if (tPag === "99" && (!xPag || xPag.trim().length === 0)) {
    logs.push({
      type: "error",
      code: "441 (YA02a-10)",
      msg: "Rejeição: Descrição <xPag> é obrigatória para meio de pagamento 99-Outros.",
    });
  } else if (tPag === "99" && xPag && xPag.trim().length > 0) {
    logs.push({
      type: "success",
      code: "OK (YA02a-10)",
      msg: "Conforme: Tag descritiva <xPag> preenchida para tPag=99.",
    });
  }

  // Regra 4: tPag=90 ou 91 exige vPag=0.00
  if ((tPag === "91" || tPag === "90") && vPag !== 0) {
    logs.push({
      type: "warning",
      code: "Atenção SEFAZ",
      msg: `Para tPag=${tPag}, o valor <vPag> deve ser estritamente 0.00 (informado: ${vPag.toFixed(2)}).`,
    });
  } else if ((tPag === "91" || tPag === "90") && vPag === 0) {
    logs.push({
      type: "success",
      code: "OK (IT 2024.002)",
      msg: `vPag zerado corretamente (0.00) para meio sem quitação imediata (${tPag === "91" ? "Pagamento Posterior" : "Sem Pagamento"}).`,
    });
  }

  // Regra 5: Soma dos pagamentos vs valor da nota (YA03-10)
  if (tPag !== "90" && tPag !== "91" && finNFe === "1") {
    if (vPag < vNF) {
      if (model === "65") {
        logs.push({
          type: "error",
          code: "865 (YA03-10)",
          msg: `Rejeição na NFC-e: Total de pagamentos (R$ ${vPag.toFixed(2)}) é menor que o valor total da nota (R$ ${vNF.toFixed(2)}).`,
        });
      } else {
        logs.push({
          type: "warning",
          code: "NT 2025.001 (Mod 55)",
          msg: `NF-e (55): Validação YA03-10 diferida (Implementação Futura no B2B). Não bloqueia autorização no momento.`,
        });
      }
    } else {
      logs.push({
        type: "success",
        code: "OK (YA03-10)",
        msg: "Soma de pagamentos cobre integralmente o valor total da operação.",
      });
    }
  }

  // Regra 6: Meios não eletrônicos não podem ter grupo card (YA04-20)
  if (!isElectronic && tpIntegra === "1") {
    logs.push({
      type: "error",
      code: "963 (YA04-20)",
      msg: "Rejeição: Grupo <card> enviado indevidamente para meio de pagamento não eletrônico.",
    });
  }

  // Regra 7: Verificação de troco (YA09-10 e YA09-20)
  if (troco > 0) {
    logs.push({
      type: "info",
      code: "vTroco Calculado",
      msg: `Troco de R$ ${troco.toFixed(2)} gerado automaticamente no grupo <pag>.`,
    });
    if (troco > 1000) {
      logs.push({
        type: "warning",
        code: "965 (YA09-20)",
        msg: `Atenção: Troco de R$ ${troco.toFixed(2)} pode exceder o teto máximo parametrizado pela SEFAZ estadual.`,
      });
    }
  }

  return logs;
}
