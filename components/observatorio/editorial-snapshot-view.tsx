import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink, FileWarning, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EditorialSnapshot, NotionSnapshotBlock } from "@/lib/observatorio/editorial-snapshot";
import { blockDisplayText, collectSnapshotLinks, countSnapshotBlocks, richTextSegments, snapshotBlockUrl, type RichTextSegment } from "@/lib/observatorio/editorial-snapshot-render";

function RichText({ data }: { data: unknown }) {
  return <>{richTextSegments(data).map((segment, index) => <RichTextSegmentView key={`${segment.text}-${index}`} segment={segment} />)}</>;
}

function RichTextSegmentView({ segment }: { segment: RichTextSegment }) {
  let content: ReactNode = segment.text;
  if (segment.code) content = <code>{content}</code>;
  if (segment.strikethrough) content = <s>{content}</s>;
  if (segment.underline) content = <u>{content}</u>;
  if (segment.italic) content = <em>{content}</em>;
  if (segment.bold) content = <strong>{content}</strong>;
  return segment.href ? <Link href={segment.href} target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">{content}</Link> : content;
}

function Block({ block, depth = 0 }: { block: NotionSnapshotBlock; depth?: number }) {
  const text = blockDisplayText(block);
  const href = snapshotBlockUrl(block);
  const richText = (block.data as Record<string, unknown>).rich_text;
  const nested = block.children.length > 0 && <div className="ml-4 space-y-3 border-l border-border/70 pl-4">{block.children.map((child) => <Block key={child.id} block={child} depth={depth + 1} />)}</div>;
  if (block.type === "child_page") return <div className="space-y-3"><h4 className="font-heading text-base font-semibold tracking-tight">{text || "Página filha sem título"}</h4>{nested}</div>;
  if (["heading_1", "heading_2", "heading_3"].includes(block.type)) {
    const Tag = block.type === "heading_1" ? "h2" : block.type === "heading_2" ? "h3" : "h4";
    return <div className="space-y-3"><Tag className="font-heading text-xl font-semibold tracking-tight">{text ? <RichText data={richText} /> : "Título sem texto"}</Tag>{nested}</div>;
  }
  if (["bulleted_list_item", "numbered_list_item", "to_do"].includes(block.type)) return <div className="space-y-3"><div className="flex gap-2 text-sm leading-7"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />{text ? <RichText data={richText} /> : "Item sem texto"}</div>{nested}</div>;
  if (["quote", "callout"].includes(block.type)) return <div className="space-y-3 border-l-2 border-primary/60 pl-4 text-sm italic leading-7 text-muted-foreground">{text ? <RichText data={richText} /> : "Bloco destacado sem texto"}{nested}</div>;
  if (href) return <div className="space-y-3"><Link href={href} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-2 break-all text-sm text-primary underline-offset-4 hover:underline"><Link2 className="size-4 shrink-0" />{text ? <RichText data={richText} /> : href}<ExternalLink className="size-3 shrink-0" /></Link>{nested}</div>;
  if (text) return <div className="space-y-3"><p className="whitespace-pre-wrap text-sm leading-7 text-foreground/90"><RichText data={richText} /></p>{nested}</div>;
  return <div className="space-y-3"><div className="flex items-center gap-2 text-xs text-muted-foreground"><FileWarning className="size-4" />Bloco {block.type} sem representação textual segura.</div>{nested}</div>;
}

export function EditorialSnapshotView({ snapshot }: { snapshot: EditorialSnapshot }) {
  const links = collectSnapshotLinks(snapshot.content.blocks);
  const totalBlocks = countSnapshotBlocks(snapshot.content.blocks);
  return <div className="space-y-6">
    <Card variant="glass"><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>Conteúdo integral do snapshot</CardTitle><Badge variant="success">{totalBlocks} blocos totais</Badge></div><p className="text-xs text-muted-foreground">{snapshot.content.blocks.length} blocos raiz; filhos aninhados preservados recursivamente. Conteúdo incompleto não é exibido como se fosse íntegro.</p></CardHeader><CardContent><div className="space-y-6">{snapshot.content.blocks.map((block) => <Block key={block.id} block={block} />)}</div></CardContent></Card>
    <Card variant="outline"><CardHeader><CardTitle className="flex items-center gap-2"><Link2 className="size-4 text-primary" />Referências e links</CardTitle></CardHeader><CardContent>{links.length ? <ul className="space-y-2">{links.map((href) => <li key={href}><Link href={href} target="_blank" rel="noreferrer" className="break-all text-sm text-primary underline-offset-4 hover:underline">{href}</Link></li>)}</ul> : <p className="text-sm text-muted-foreground">Nenhum link externo seguro identificado no snapshot.</p>}</CardContent></Card>
  </div>;
}
