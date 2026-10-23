import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CanalObservatorio } from "@/lib/observatorio/types";
import { PublicLogo } from "@/components/observatorio-public/public-logo";

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
          <PublicLogo />
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Navegação principal">
            <Link
              href="/panorama"
              className={cn(
                "py-5 transition-colors hover:text-[var(--edition-accent)]",
                channel === "panorama"
                  ? "border-b-2 border-[var(--edition-accent)] font-semibold text-[var(--edition-accent)]"
                  : "text-slate-600",
              )}
            >
              Panorama
            </Link>
            <Link
              href="/tech"
              className={cn(
                "py-5 transition-colors hover:text-[var(--edition-accent)]",
                channel === "tech"
                  ? "border-b-2 border-[var(--edition-accent)] font-semibold text-[var(--edition-accent)]"
                  : "text-slate-600",
              )}
            >
              Tech
            </Link>
            <Link
              href={`/${channel}#edicoes`}
              className="py-5 text-slate-600 transition-colors hover:text-[var(--edition-accent)]"
            >
              Edições
            </Link>
          </nav>
          <Link
            href={`/${channel}/assinar`}
            className="ml-auto hidden min-h-10 items-center gap-2 rounded-lg bg-[var(--edition-accent)] px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:inline-flex"
          >
            Assinar {name}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <details className="relative ml-auto md:hidden">
            <summary
              className="grid size-10 cursor-pointer list-none place-items-center rounded-lg border border-violet-100 bg-white transition-colors hover:bg-[var(--edition-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--edition-accent)] [&::-webkit-details-marker]:hidden"
              aria-label="Abrir menu de leitura"
            >
              <Menu className="size-5" aria-hidden="true" />
            </summary>
            <nav
              aria-label="Menu mobile da edição"
              className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-violet-100 bg-white p-2 shadow-xl"
            >
              <Link
                href="/panorama"
                className={cn(
                  "block rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-violet-50",
                  channel === "panorama" ? "bg-violet-50 font-semibold text-violet-700" : "text-slate-700",
                )}
              >
                Panorama
              </Link>
              <Link
                href="/tech"
                className={cn(
                  "block rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-violet-50",
                  channel === "tech" ? "bg-violet-50 font-semibold text-violet-700" : "text-slate-700",
                )}
              >
                Tech
              </Link>
              <Link
                href={`/${channel}#edicoes`}
                className="block rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-violet-50"
              >
                Edições {name}
              </Link>
              <Link
                href={`/${channel}/assinar`}
                className="mt-1 block rounded-xl bg-[var(--edition-accent)] px-3 py-3 text-center text-sm font-semibold text-white transition-colors hover:opacity-90"
              >
                Assinar {name}
              </Link>
            </nav>
          </details>
        </div>
      </header>
      {children}
      <footer className="mt-20 border-t border-violet-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>Camini Observatório · leitura editorial com contexto.</p>
          <div className="flex items-center gap-4">
            <Link
              href={`/${channel}#edicoes`}
              className="font-medium text-[var(--edition-accent)] transition-colors hover:text-violet-800"
            >
              Edições
            </Link>
            <Link
              href={`/${channel}`}
              className="font-medium text-[var(--edition-accent)] transition-colors hover:text-violet-800"
            >
              Voltar ao {name}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
