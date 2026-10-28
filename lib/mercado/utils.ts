/**
 * CAMINI MERCADO — Utilitários de Formatação, Moeda e Compressão de Imagens
 */

/**
 * Formata um valor numérico em reais (BRL).
 * Ex: 12.5 -> "R$ 12,50"
 */
export function formatBRL(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val);
}

/**
 * Converte valor em centavos (inteiro) para valor decimal em reais.
 * Ex: 1990 -> 19.90
 */
export function centsToDecimal(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

/**
 * Converte valor decimal em reais para centavos (inteiro).
 * Ex: 19.90 -> 1990
 */
export function decimalToCents(decimal: number): number {
  return Math.round(decimal * 100);
}

/**
 * Formata centavos diretamente para string com vírgula, sem o símbolo R$.
 * Ex: 1990 -> "19,90"
 * Ex: 5 -> "0,05"
 * Ex: 0 -> "0,00"
 */
export function formatCentsInput(cents: number): string {
  const safeCents = Math.max(0, Math.floor(cents));
  const rawStr = safeCents.toString().padStart(3, "0");
  const integerPart = rawStr.slice(0, -2);
  const decimalPart = rawStr.slice(-2);
  // Formatar parte inteira com pontos de milhar
  const formattedInt = new Intl.NumberFormat("pt-BR").format(Number(integerPart));
  return `${formattedInt},${decimalPart}`;
}

/**
 * Extrai apenas os dígitos de uma string e retorna como número de centavos.
 * Suporta o comportamento de caixa registradora (ATM style):
 * Digitar '1' -> 1 centavo (0,01)
 * Digitar '15' -> 15 centavos (0,15)
 * Digitar '150' -> 150 centavos (1,50)
 * Digitar '1500' -> 1500 centavos (15,00)
 */
export function parseCentsFromDigits(input: string): number {
  const cleanDigits = input.replace(/\D/g, "");
  if (!cleanDigits) return 0;
  // Limitar a 10 dígitos para evitar overflow
  const truncated = cleanDigits.slice(-10);
  return parseInt(truncated, 10);
}

/**
 * Gera o nome padrão do carrinho baseado na data e hora atuais.
 * Ex: "Compras — 28/10 às 15:30"
 */
export function generateDefaultCartName(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `Compras — ${day}/${month} às ${hours}:${minutes}`;
}

/**
 * Formata data e hora para exibição amigável em listas e detalhes.
 */
export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Data indisponível";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "Data indisponível";
  }
}

/**
 * Comprime uma imagem cliente-side (via Canvas) antes de salvar no IndexedDB/Supabase.
 * Converte para JPEG ou WebP redimensionado (máx 900px na maior dimensão),
 * reduzindo arquivos de 4-10MB da câmera para menos de 100KB com excelente nitidez.
 */
export async function compressClientImage(
  fileOrBase64: File | string,
  maxDimension = 900,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Se estiver rodando no SSR
    if (typeof window === "undefined") {
      resolve("");
      return;
    }

    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Calcular novas dimensões mantendo proporção
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Não foi possível inicializar canvas 2D"));
        return;
      }

      // Preenchimento branco para evitar transparência preta em JPEGs
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Preferência por WebP se suportado, senão JPEG
      try {
        const webpData = canvas.toDataURL("image/webp", quality);
        if (webpData.startsWith("data:image/webp")) {
          resolve(webpData);
          return;
        }
      } catch {}

      const jpegData = canvas.toDataURL("image/jpeg", quality);
      resolve(jpegData);
    };

    img.onerror = (err) => {
      reject(new Error("Erro ao carregar imagem para compressão: " + err));
    };

    if (typeof fileOrBase64 === "string") {
      img.src = fileOrBase64;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    }
  });
}
