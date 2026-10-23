import { CalendarDays } from "lucide-react";
import Link from "next/link";
import type { Edicao } from "@/lib/observatorio/types";
import type { CanalObservatorio } from "@/lib/observatorio/types";
import { EditorialEmptyState } from "./editorial-empty-state";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function EditionArchive({ channel, editions }: { channel: CanalObservatorio; editions: Edicao[] }) {
  if (editions.length === 0) return <EditorialEmptyState />;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {editions.map((edition, index) => (
        <Link
          key={edition.id}
          href={`/${channel}/edicoes/${edition.identificador}`}
          aria-label={`Ler a edição ${edition.titulo}`}
          className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-950/5"
        >
          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            <span>{index === 0 ? "Edição mais recente" : "Edição publicada"}</span>
            <CalendarDays className="size-4" aria-hidden="true" />
          </div>
          <h3 className="mt-5 text-xl font-bold leading-snug tracking-tight text-slate-950">{edition.titulo}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{edition.resumo}</p>
          <p className="mt-6 text-xs text-slate-500">
            {edition.publicada_em ? dateFormatter.format(new Date(edition.publicada_em)) : ""}
          </p>
        </Link>
      ))}
    </div>
  );
}
