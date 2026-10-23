import type { NotionSnapshotBlock } from "./editorial-snapshot.ts";
import { safeExternalHref } from "./editorial-snapshot-safety.ts";

export interface RichTextSegment {
  text: string;
  href: string | null;
  bold: boolean;
  italic: boolean;
  code: boolean;
  strikethrough: boolean;
  underline: boolean;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function richTextSegments(data: unknown): RichTextSegment[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((item) => {
    const value = record(item);
    if (!value || typeof value.plain_text !== "string") return [];
    const annotations = record(value.annotations);
    const link = record(value.link);
    const linkUrl = link ? link.url : null;
    const href = safeExternalHref(value.href) ?? safeExternalHref(linkUrl);
    return [{
      text: value.plain_text,
      href,
      bold: annotations?.bold === true,
      italic: annotations?.italic === true,
      code: annotations?.code === true,
      strikethrough: annotations?.strikethrough === true,
      underline: annotations?.underline === true,
    }];
  });
}

export function richTextPlainText(data: unknown): string {
  return richTextSegments(data).map((segment) => segment.text).join("");
}

export function blockDisplayText(block: NotionSnapshotBlock): string {
  const data = record(block.data) ?? {};
  if (block.type === "child_page" && typeof data.title === "string") return data.title;
  return richTextPlainText(data.rich_text) || (typeof data.caption === "string" ? data.caption : "");
}

export function snapshotBlockUrl(block: NotionSnapshotBlock): string | null {
  const data = record(block.data) ?? {};
  for (const key of ["url", "external_url"]) {
    const href = safeExternalHref(data[key]);
    if (href) return href;
  }
  const external = record(data.external);
  const externalHref = external ? safeExternalHref(external.url) : null;
  if (externalHref) return externalHref;
  const file = record(data.file);
  return file ? safeExternalHref(file.url) : null;
}

export function snapshotBlockCaption(block: NotionSnapshotBlock): RichTextSegment[] {
  const data = record(block.data) ?? {};
  return richTextSegments(data.caption);
}

export function collectSnapshotLinks(blocks: NotionSnapshotBlock[], links: string[] = []): string[] {
  for (const block of blocks) {
    const blockHref = snapshotBlockUrl(block);
    if (blockHref && !links.includes(blockHref)) links.push(blockHref);
    const data = record(block.data);
    for (const segment of richTextSegments(data?.rich_text)) {
      if (segment.href && !links.includes(segment.href)) links.push(segment.href);
    }
    collectSnapshotLinks(block.children, links);
  }
  return links;
}

export function countSnapshotBlocks(blocks: NotionSnapshotBlock[]): number {
  return blocks.reduce((total, block) => total + 1 + countSnapshotBlocks(block.children), 0);
}
