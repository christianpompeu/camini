import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      </div>
    </header>
  );
}
