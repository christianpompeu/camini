import Link from "next/link";
import { ArrowRight, Menu, Orbit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CanalObservatorio } from "@/lib/observatorio/types";

const channelName = { panorama: "Panorama", tech: "Tech" } as const;

export function PublicEditionShell({
  channel,
  children,
  className,
}: {
  channel: CanalObservatorio;
  children: React.ReactNode;
  className?: string;
}) {
  const name = channelName[channel];
  return (
    <div
      className={cn(
        "min-h-screen bg-[#fbfbfe] text-[#101127] [--edition-accent:#6237ed] [--edition-soft:#f1edff] selection:bg-violet-200 dark:bg-[#fbfbfe] dark:text-[#101127]",
        channel === "tech" && "[--edition-accent:#4d39f1] [--edition-soft:#eeedff]",
        className,
      )}
    >
      <header className="sticky top-0 z-40 border-b border-violet-100/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-5 sm:px-8 lg:px-10">
          <Link href={`/${channel}`} className="group inline-flex items-center gap-2 font-semibold tracking-tight" aria-label={`Camini ${name}`}>
            <span className="grid size-8 place-items-center rounded-xl bg-[var(--edition-accent)] text-white shadow-sm transition-transform duration-200 group-hover:rotate-6">
              <Orbit className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg">Camini</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Navegação principal">
            <Link href={`/${channel}`} className="border-b-2 border-[var(--edition-accent)] py-5 text-[var(--edition-accent)]">{name}</Link>
            <Link href="/" className="py-5 text-slate-600 transition-colors hover:text-[var(--edition-accent)]">Produtos</Link>
          </nav>
          <Link
            href={`/${channel}/assinar`}
            className="ml-auto hidden min-h-10 items-center gap-2 rounded-lg bg-[var(--edition-accent)] px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:inline-flex"
          >
            Assinar {name}<ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href={`/${channel}`} className="ml-auto grid size-10 place-items-center rounded-lg border border-violet-100 bg-white transition-colors hover:bg-[var(--edition-soft)] sm:ml-0 md:hidden" aria-label={`Abrir página do ${name}`}>
            <Menu className="size-5" aria-hidden="true" />
          </Link>
        </div>
      </header>
      {children}
      <footer className="mt-20 border-t border-violet-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>Camini Observatório · leitura editorial com contexto.</p>
          <Link href={`/${channel}`} className="font-medium text-[var(--edition-accent)] transition-colors hover:text-violet-800">Voltar ao {name}</Link>
        </div>
      </footer>
    </div>
  );
}
