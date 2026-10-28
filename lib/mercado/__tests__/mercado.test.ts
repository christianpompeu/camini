import { describe, it } from "node:test";
import assert from "node:assert";
import {
  centsToDecimal,
  decimalToCents,
  formatCentsInput,
  parseCentsFromDigits,
  formatBRL,
  generateDefaultCartName,
} from "../utils.ts";

describe("CAMINI MERCADO — Utilitários de Moeda e Formatação", () => {
  it("deve converter centavos para decimal e vice-versa com precisão", () => {
    assert.strictEqual(centsToDecimal(1990), 19.9);
    assert.strictEqual(centsToDecimal(5), 0.05);
    assert.strictEqual(centsToDecimal(0), 0);

    assert.strictEqual(decimalToCents(19.9), 1990);
    assert.strictEqual(decimalToCents(0.05), 5);
    assert.strictEqual(decimalToCents(12.34), 1234);
  });

  it("deve posicionar vírgula automaticamente sem exigir digitação de vírgula", () => {
    // Digitar '1' -> 1 centavo
    assert.strictEqual(parseCentsFromDigits("1"), 1);
    assert.strictEqual(formatCentsInput(1), "0,01");

    // Digitar '15' -> 15 centavos
    assert.strictEqual(parseCentsFromDigits("15"), 15);
    assert.strictEqual(formatCentsInput(15), "0,15");

    // Digitar '150' -> R$ 1,50
    assert.strictEqual(parseCentsFromDigits("150"), 150);
    assert.strictEqual(formatCentsInput(150), "1,50");

    // Digitar '1500' -> R$ 15,00
    assert.strictEqual(parseCentsFromDigits("1500"), 1500);
    assert.strictEqual(formatCentsInput(1500), "15,00");

    // Digitar '12590' -> R$ 125,90
    assert.strictEqual(parseCentsFromDigits("12590"), 12590);
    assert.strictEqual(formatCentsInput(12590), "125,90");
  });

  it("deve formatar valores monetários BRL corretamente", () => {
    const formatted = formatBRL(12.5);
    // Deve conter R$ e 12,50
    assert.ok(formatted.includes("12,50"));
    assert.ok(formatted.includes("R$"));
  });

  it("deve gerar nome padrão do carrinho com dia e hora", () => {
    const fixedDate = new Date(2026, 9, 28, 15, 30); // 28 de outubro de 2026, 15:30
    const name = generateDefaultCartName(fixedDate);
    assert.strictEqual(name, "Compras — 28/10 às 15:30");
  });
});

describe("CAMINI MERCADO — Cálculo de Carrinho e Itens", () => {
  it("deve calcular o subtotal de item multiplicando quantidade por preço unitário", () => {
    const qty = 3;
    const unitPrice = 4.99;
    const subtotal = Number((qty * unitPrice).toFixed(2));
    assert.strictEqual(subtotal, 14.97);
  });

  it("deve calcular a soma total do carrinho dinamicamente", () => {
    const items = [
      { nome: "Arroz 5kg", quantidade: 2, precoUnitario: 28.9, precoTotal: 57.8 },
      { nome: "Leite Integral", quantidade: 6, precoUnitario: 5.49, precoTotal: 32.94 },
      { nome: "Café 500g", quantidade: 1, precoUnitario: 18.5, precoTotal: 18.5 },
    ];

    const grandTotal = items.reduce((sum, it) => sum + it.precoTotal, 0);
    assert.strictEqual(Number(grandTotal.toFixed(2)), 109.24);

    const totalUnits = items.reduce((sum, it) => sum + it.quantidade, 0);
    assert.strictEqual(totalUnits, 9);
  });
});
