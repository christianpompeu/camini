import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Layers3, Sparkles } from "lucide-react";
import { PublicEditionShell } from "./public-edition-shell";
import { PublicSnapshotView } from "./public-snapshot-view";
import { blockDisplayText } from "@/lib/observatorio/editorial-snapshot-render";
import { publicEditionSnapshot } from "@/lib/observatorio/publication";
import type { CanalObservatorio, Edicao } from "@/lib/observatorio/types";

const names = { panorama: "Panorama", tech: "Tech" } as const;

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" }).format(date);
}

function editionTopics(edition: Edicao): string[] {
  const snapshot = publicEditionSnapshot(edition);
  if (!snapshot) return [];
  return snapshot.content.blocks
    .filter((block) => ["heading_1", "heading_2", "child_page"].includes(block.type))
    .map(blockDisplayText)
    .filter(Boolean)
    .slice(0, 6);
}

export function PublicEditionPage({
  channel,
  edition,
  recentEditions,
}: {
  channel: CanalObservatorio;
  edition: Edicao;
  recentEditions: Edicao[];
}) {
  const snapshot = publicEditionSnapshot(edition);
  if (!snapshot) return null;
  const name = names[channel];
  const publishedAt = formatDate(edition.publicada_em);
  const topics = editionTopics(edition);
  const archive = recentEditions.filter((item) => item.id !== edition.id).slice(0, 4);

  return <PublicEditionShell channel={channel}>
    <main>
      <div className="relative overflow-hidden border-b border-violet-100 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_15%,rgba(124,91,255,0.14),transparent_32%),radial-gradient(circle_at_18%_88%,rgba(99,55,237,0.08),transparent_30%)]" aria-hidden="true" />
        <header className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link href={`/${channel}`} className="rounded-full bg-[var(--edition-soft)] px-3 py-1.5 font-semibold text-[var(--edition-accent)] transition-colors hover:bg-violet-200">{name}</Link>
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-600"><Layers3 className="size-4" aria-hidden="true" />Edição publicada</span>
              {publishedAt && <><span aria-hidden="true">·</span><time dateTime={edition.publicada_em ?? undefined}>{publishedAt}</time></>}
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.06] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">{edition.titulo}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">{edition.resumo}</p>
            {topics.length > 0 && <div className="mt-7 flex flex-wrap gap-2" aria-label="Tópicos da edição">{topics.map((topic) => <span key={topic} className="rounded-full border border-violet-100 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 shadow-xs">{topic}</span>)}</div>}
          </div>
        </header>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_21rem] lg:px-10 lg:py-16">
        <article className="min-w-0" aria-label={`Conteúdo da edição ${edition.titulo}`}>
          <section className="mb-12 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm sm:p-7" aria-labelledby="edition-summary">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white text-[var(--edition-accent)] shadow-sm"><Sparkles className="size-5" aria-hidden="true" /></span><h2 id="edition-summary" className="text-xl font-bold tracking-tight text-slate-950">Resumo da edição</h2></div>
            <p className="mt-4 text-base leading-7 text-slate-600">{edition.resumo}</p>
            {topics.length > 0 && <ul className="mt-5 grid gap-2 sm:grid-cols-2">{topics.slice(0, 4).map((topic) => <li key={topic} className="flex items-start gap-2 text-sm leading-6 text-slate-600"><CheckCircle2 className="mt-1 size-4 shrink-0 text-violet-500" aria-hidden="true" />{topic}</li>)}</ul>}
          </section>
          <PublicSnapshotView snapshot={snapshot} />
        </article>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="Contexto da edição">
          {topics.length > 0 && <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold text-slate-950"><Layers3 className="size-5 text-[var(--edition-accent)]" aria-hidden="true" />Nesta edição</h2><ol className="mt-4 space-y-3">{topics.map((topic, index) => <li key={topic} className="flex gap-3 text-sm leading-5 text-slate-600"><span className="font-mono text-xs font-semibold text-violet-500">{String(index + 1).padStart(2, "0")}</span><span>{topic}</span></li>)}</ol></section>}
          {archive.length > 0 && <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold text-slate-950"><CalendarDays className="size-5 text-[var(--edition-accent)]" aria-hidden="true" />Arquivo recente</h2><ul className="mt-4 divide-y divide-violet-100">{archive.map((item) => <li key={item.id} className="py-4 first:pt-0 last:pb-0"><Link href={`/${channel}/edicoes/${item.identificador}`} className="group block"><time className="text-xs text-slate-400">{formatDate(item.publicada_em)}</time><span className="mt-1 block text-sm font-semibold leading-5 text-slate-800 transition-colors group-hover:text-[var(--edition-accent)]">{item.titulo}</span></Link></li>)}</ul></section>}
          <section id="assinar" className="overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-lg"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Camini {name}</p><h2 className="mt-3 text-xl font-bold">Continue acompanhando o que importa.</h2><p className="mt-3 text-sm leading-6 text-slate-300">Conheça a proposta editorial e registre seu interesse em acompanhar novas publicações.</p><Link href={`/${channel}/assinar`} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-violet-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">Conhecer a assinatura<ArrowRight className="size-4" aria-hidden="true" /></Link></section>
        </aside>
      </div>
    </main>
  </PublicEditionShell>;
}
