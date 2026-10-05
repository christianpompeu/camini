/**
 * Formatadores de data centralizados para o Radar da Reforma Tributária.
 * Utiliza explicitamente o fuso horário 'America/Fortaleza' conforme requisitos editoriais.
 */

const TIMEZONE = "America/Fortaleza";

/**
 * Formato por extenso: "29 de setembro de 2026"
 */
export function formatRadarDate(isoString: string | null | undefined): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: TIMEZONE,
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Formato curto: "29 set 2026"
 */
export function formatRadarShortDate(
  isoString: string | null | undefined
): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: TIMEZONE,
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Formato com hora: "29 de setembro de 2026 · 17h00"
 */
export function formatRadarDateTime(
  isoString: string | null | undefined
): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const datePart = new Intl.DateTimeFormat("pt-BR", {
      timeZone: TIMEZONE,
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
    const timePart = new Intl.DateTimeFormat("pt-BR", {
      timeZone: TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
    return `${datePart} · ${timePart.replace(":", "h")}`;
  } catch {
    return isoString;
  }
}
