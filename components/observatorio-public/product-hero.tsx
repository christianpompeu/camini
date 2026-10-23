import Link from "next/link";
import { ArrowDown, ArrowRight, Network, Orbit, Sparkles } from "lucide-react";
import type { PublicProduct } from "@/lib/observatorio/public-content";

export function ProductHero({ product, hasEditions }: { product: PublicProduct; hasEditions: boolean }) {
  const tech = product.channel === "tech";
  return (
    <section className="relative overflow-hidden border-b border-violet-950/5 bg-[linear-gradient(135deg,#fff_0%,#faf9ff_52%,#f0f7ff_100%)]">
      <div className="pointer-events-none absolute -left-24 top-20 size-80 rounded-full bg-violet-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 -top-20 size-[30rem] rounded-full bg-cyan-200/25 blur-3xl" />
      <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.03fr_.97fr] lg:py-24">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm">
            {tech ? <Orbit className="size-3.5" /> : <Network className="size-3.5" />}
            {product.name} <span className="font-normal text-slate-500">· {product.eyebrow}</span>
          </p>
          <h1 className="mt-7 max-w-3xl text-[clamp(2.75rem,7vw,5.6rem)] font-black leading-[.96] tracking-[-.06em] text-slate-950">
            <span className="text-violet-600">{product.name}.</span> {product.headline}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{product.description}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#edicoes" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">
              {hasEditions ? "Ler edição mais recente" : "Conhecer a proposta"} <ArrowDown className="size-4" />
            </a>
            <Link href={`/${product.channel}/assinar`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-6 text-sm font-semibold text-violet-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">
              Quero acompanhar <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-violet-300/30 via-transparent to-cyan-300/30 blur-2xl" />
          <div className="relative rotate-1 rounded-[2rem] border border-white/90 bg-white/80 p-5 shadow-[0_30px_100px_-35px_rgba(55,20,130,.35)] backdrop-blur-xl transition-transform duration-500 hover:rotate-0 sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-600">Observatório Camini</p><p className="mt-1 font-bold text-slate-950">{product.name}</p></div>
              <Sparkles className="size-6 text-violet-500" />
            </div>
            <div className="space-y-4 py-6">
              {product.themes.slice(0, 4).map((theme, index) => (
                <div key={theme} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 text-sm font-bold text-white">0{index + 1}</span>
                  <div className="min-w-0"><p className="text-xs font-semibold text-violet-600">{theme}</p><div className="mt-2 h-2 w-full rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${82 - index * 11}%` }} /></div></div>
                </div>
              ))}
            </div>
            <p className="border-t border-slate-100 pt-5 text-sm leading-6 text-slate-600">{product.proposition}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
