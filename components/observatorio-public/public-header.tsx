import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { PublicLogo } from "./public-logo";
import type { CanalObservatorio } from "@/lib/observatorio/types";
import { cn } from "@/lib/utils";

export function PublicHeader({ channel }: { channel: CanalObservatorio }) {
  return (
    <header className="sticky top-0 z-50 overflow-x-clip border-b border-violet-950/8 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-8">
        <PublicLogo />
        <nav aria-label="Publicações do Observatório" className="hidden min-w-0 items-center gap-0.5 sm:flex sm:gap-2">
          {(["panorama", "tech"] as const).map((item) => (
            <Link
              key={item}
              href={`/${item}`}
              aria-current={channel === item ? "page" : undefined}
              className={cn(
                "rounded-full px-2 py-2 text-xs font-medium capitalize transition-all duration-200 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:px-3 sm:text-sm",
                channel === item ? "bg-violet-50 text-violet-700" : "text-slate-600",
              )}
            >
              {item}
            </Link>
          ))}
        </nav>
        <Link
          href={`/${channel}/assinar`}
          className="hidden min-h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:inline-flex"
        >
          Assinar <ArrowRight className="size-4" />
        </Link>
        <details className="relative sm:hidden">
          <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-violet-100 bg-white text-slate-700 transition-colors hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 [&::-webkit-details-marker]:hidden" aria-label="Abrir menu principal"><Menu className="size-5" aria-hidden="true" /></summary>
          <nav aria-label="Menu mobile" className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-violet-100 bg-white p-2 shadow-xl">
            {(["panorama", "tech"] as const).map((item) => <Link key={item} href={`/${item}`} className="block rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-700">{item === "panorama" ? "Panorama" : "Tech"}</Link>)}
            <Link href={`/${channel}/assinar`} className="mt-1 block rounded-xl bg-violet-600 px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700">Assinar</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
