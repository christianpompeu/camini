/**
 * Utilitário de alta precisão para cálculo de coordenadas do cursor (caret) em elementos <textarea>
 * baseado na técnica de elemento espelho (mirror div) sem dependências externas.
 */

// Propriedades CSS que afetam diretamente o layout do texto
const MIRROR_PROPERTIES = [
  "direction",
  "boxSizing",
  "width",
  "height",
  "overflowX",
  "overflowY",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStyle",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "fontSizeAdjust",
  "lineHeight",
  "fontFamily",
  "textAlign",
  "textTransform",
  "textIndent",
  "textDecoration",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
  "MozTabSize",
  "whiteSpace",
  "wordBreak",
  "wordWrap",
] as const;

export interface CaretCoordinates {
  top: number;
  left: number;
  lineHeight: number;
}

let mirrorDiv: HTMLDivElement | null = null;

function getMirrorDiv(): HTMLDivElement {
  if (!mirrorDiv) {
    mirrorDiv = document.createElement("div");
    mirrorDiv.id = "sql-studio-caret-mirror";
    mirrorDiv.style.position = "absolute";
    mirrorDiv.style.top = "-9999px";
    mirrorDiv.style.left = "-9999px";
    mirrorDiv.style.visibility = "hidden";
    mirrorDiv.style.pointerEvents = "none";
    document.body.appendChild(mirrorDiv);
  }
  return mirrorDiv;
}

export function getCaretCoordinates(
  element: HTMLTextAreaElement,
  position: number
): CaretCoordinates {
  if (typeof window === "undefined") {
    return { top: 0, left: 0, lineHeight: 20 };
  }

  const div = getMirrorDiv();
  const style = window.getComputedStyle(element);

  // Copia os estilos computados do textarea para o div espelho
  MIRROR_PROPERTIES.forEach((prop) => {
    // @ts-expect-error property access
    div.style[prop] = style[prop];
  });

  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.overflow = "hidden";

  // Conteúdo do textarea até a posição do cursor
  div.textContent = element.value.substring(0, position);

  // Span marcador na posição exata do caret
  const span = document.createElement("span");
  span.textContent = element.value.substring(position) || ".";
  div.appendChild(span);

  const parsedLineHeight = parseInt(style.lineHeight, 10);
  const lineHeight = isNaN(parsedLineHeight) ? 20 : parsedLineHeight;

  const coordinates: CaretCoordinates = {
    top: span.offsetTop - element.scrollTop,
    left: span.offsetLeft - element.scrollLeft,
    lineHeight,
  };

  return coordinates;
}
