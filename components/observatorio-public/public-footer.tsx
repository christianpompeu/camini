import Link from "next/link";
import { PublicLogo } from "./public-logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <PublicLogo />
          <p className="max-w-md text-sm leading-6 text-slate-500">
            Informação organizada com contexto, responsabilidade editorial e perspectiva.
          </p>
        </div>
        <nav aria-label="Links institucionais" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
          <Link className="transition-colors hover:text-violet-700" href="/panorama">Panorama</Link>
          <Link className="transition-colors hover:text-violet-700" href="/tech">Tech</Link>
          <Link className="transition-colors hover:text-violet-700" href="/">Camini</Link>
        </nav>
      </div>
    </footer>
  );
}
