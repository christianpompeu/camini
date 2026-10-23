import Link from "next/link";
import { ExternalLink, FileWarning, Link2, Quote } from "lucide-react";
import type { ReactNode } from "react";
import type { EditorialSnapshot, NotionSnapshotBlock } from "@/lib/observatorio/editorial-snapshot";
import {
  blockDisplayText,
  collectSnapshotLinks,
  richTextSegments,
  snapshotBlockCaption,
  snapshotBlockUrl,
  type RichTextSegment,
} from "@/lib/observatorio/editorial-snapshot-render";

function Segment({ segment }: { segment: RichTextSegment }) {
  let content: ReactNode = segment.text;
  if (segment.code) content = <code className="rounded bg-violet-50 px-1.5 py-0.5 font-mono text-[0.92em] text-violet-900">{content}</code>;
  if (segment.strikethrough) content = <s>{content}</s>;
  if (segment.underline) content = <u>{content}</u>;
  if (segment.italic) content = <em>{content}</em>;
  if (segment.bold) content = <strong className="font-semibold text-slate-950">{content}</strong>;
  return segment.href ? (
    <Link href={segment.href} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--edition-accent)] underline decoration-violet-300 underline-offset-4 transition-colors hover:text-violet-800">{content}</Link>
  ) : content;
}

function RichText({ data }: { data: unknown }) {
  return <>{richTextSegments(data).map((segment, index) => <Segment key={`${segment.text}-${index}`} segment={segment} />)}</>;
}

function Children({ blocks, depth }: { blocks: NotionSnapshotBlock[]; depth: number }) {
  if (!blocks.length) return null;
  return <div className={depth > 0 ? "mt-4 border-l border-violet-100 pl-4 sm:pl-6" : "mt-4"}>{blocks.map((block) => <Block key={block.id} block={block} depth={depth + 1} />)}</div>;
}

function Block({ block, depth = 0 }: { block: NotionSnapshotBlock; depth?: number }) {
  const data = block.data as Record<string, unknown>;
  const text = blockDisplayText(block);
  const richText = data.rich_text;
  const href = snapshotBlockUrl(block);
  const children = <Children blocks={block.children} depth={depth} />;

  if (block.type === "divider") return <hr className="my-10 border-violet-100" />;
  if (block.type === "child_page") return <section className="my-8"><h2 className="text-2xl font-bold tracking-tight text-slate-950">{text || "Seção sem título"}</h2>{children}</section>;
  if (["heading_1", "heading_2", "heading_3"].includes(block.type)) {
    const Tag = block.type === "heading_1" ? "h2" : block.type === "heading_2" ? "h3" : "h4";
    const className = block.type === "heading_1" ? "mt-12 text-3xl" : block.type === "heading_2" ? "mt-10 text-2xl" : "mt-8 text-xl";
    return <section><Tag className={`${className} scroll-mt-24 font-bold tracking-tight text-slate-950`}><RichText data={richText} /></Tag>{children}</section>;
  }
  if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
    const List = block.type === "numbered_list_item" ? "ol" : "ul";
    return <List className={`my-3 pl-6 ${List === "ol" ? "list-decimal" : "list-disc"}`}><li className="pl-1 leading-8 marker:text-[var(--edition-accent)]"><RichText data={richText} />{children}</li></List>;
  }
  if (block.type === "to_do") {
    return <div className="my-3 flex items-start gap-3 leading-8"><span className="mt-2.5 size-3.5 shrink-0 rounded border border-violet-300 bg-violet-50" aria-hidden="true" /><div><RichText data={richText} />{children}</div></div>;
  }
  if (block.type === "quote" || block.type === "callout") {
    return <blockquote className="my-8 rounded-r-xl border-l-4 border-[var(--edition-accent)] bg-violet-50/60 px-5 py-4 text-lg italic leading-8 text-slate-700"><Quote className="mb-2 size-5 text-[var(--edition-accent)]" aria-hidden="true" /><RichText data={richText} />{children}</blockquote>;
  }
  if (block.type === "code") {
    return <div className="my-7 overflow-x-auto rounded-xl bg-slate-950 p-5 text-sm text-slate-100"><pre><code><RichText data={richText} /></code></pre>{children}</div>;
  }
  if (block.type === "image" && href) {
    const caption = snapshotBlockCaption(block);
    return <figure className="my-8 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
      {/* Snapshot images are editorial source media; remote URLs remain protocol-sanitized. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={href} alt={caption.map((item) => item.text).join("") || "Imagem da edição"} className="max-h-[38rem] w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
      {caption.length > 0 && <figcaption className="px-4 py-3 text-xs leading-5 text-slate-500">{caption.map((segment, index) => <Segment key={`${segment.text}-${index}`} segment={segment} />)}</figcaption>}
      {children}
    </figure>;
  }
  if (block.type === "table") {
    return <div className="my-8 overflow-x-auto rounded-xl border border-violet-100"><table className="w-full min-w-[32rem] border-collapse text-left text-sm"><tbody>{block.children.map((row) => <TableRow key={row.id} block={row} />)}</tbody></table></div>;
  }
  if (href) {
    return <div className="my-5"><Link href={href} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-2 break-all rounded-lg border border-violet-100 bg-white px-4 py-3 text-sm font-medium text-[var(--edition-accent)] transition-all hover:-translate-y-0.5 hover:shadow-sm"><Link2 className="size-4 shrink-0" aria-hidden="true" />{text || href}<ExternalLink className="size-3.5 shrink-0" aria-hidden="true" /></Link>{children}</div>;
  }
  if (text) return <div className="my-5"><p className="whitespace-pre-wrap text-[1.0625rem] leading-8 text-slate-700"><RichText data={richText} /></p>{children}</div>;

  return <div className="my-5 rounded-lg border border-dashed border-violet-200 bg-violet-50/50 px-4 py-3 text-sm text-slate-500"><span className="inline-flex items-center gap-2"><FileWarning className="size-4" aria-hidden="true" />Bloco “{block.type}” sem representação pública segura.</span>{children}</div>;
}

function TableRow({ block }: { block: NotionSnapshotBlock }) {
  const data = block.data as Record<string, unknown>;
  const cells = Array.isArray(data.cells) ? data.cells : [];
  return <tr className="border-b border-violet-100 last:border-0">{cells.map((cell, index) => <td key={index} className="px-4 py-3 align-top leading-6 text-slate-700"><RichText data={cell} /></td>)}</tr>;
}

export function PublicSnapshotView({ snapshot }: { snapshot: EditorialSnapshot }) {
  const links = collectSnapshotLinks(snapshot.content.blocks);
  return <>
    <div className="min-w-0">{snapshot.content.blocks.map((block) => <Block key={block.id} block={block} />)}</div>
    <section className="mt-14 border-t border-violet-100 pt-8" aria-labelledby="edition-sources">
      <h2 id="edition-sources" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-950"><Link2 className="size-5 text-[var(--edition-accent)]" aria-hidden="true" />Fontes e referências</h2>
      {links.length > 0 ? <ul className="mt-5 space-y-3">{links.map((href) => <li key={href}><Link href={href} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-start gap-2 break-all text-sm leading-6 text-[var(--edition-accent)] underline-offset-4 transition-colors hover:text-violet-800 hover:underline">{href}<ExternalLink className="mt-1 size-3.5 shrink-0" aria-hidden="true" /></Link></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">Nenhuma referência externa segura foi registrada neste snapshot.</p>}
    </section>
  </>;
}
