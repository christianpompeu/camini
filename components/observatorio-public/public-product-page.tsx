import Link from "next/link";
import { ArrowRight, Check, Layers3 } from "lucide-react";
import type { Edicao } from "@/lib/observatorio/types";
import type { PublicProduct } from "@/lib/observatorio/public-content";
import { PublicHeader } from "./public-header";
import { PublicFooter } from "./public-footer";
import { ProductHero } from "./product-hero";
import { EditionArchive } from "./edition-archive";

export function PublicProductPage({ product, editions }: { product: PublicProduct; editions: Edicao[] }) {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbfbfe] text-slate-950">
      <PublicHeader channel={product.channel} />
      <main>
        <ProductHero product={product} hasEditions={editions.length > 0} />
        <section aria-labelledby="features-title" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="mb-9 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">Como funciona</p>
            <h2 id="features-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Uma leitura construída para dar perspectiva.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {product.features.map((feature, index) => (
              <article key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-950/5">
                <span className="grid size-10 place-items-center rounded-xl bg-violet-100 font-mono text-xs font-bold text-violet-700">0{index + 1}</span>
                <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="edicoes" aria-labelledby="editions-title" className="scroll-mt-24 border-y border-slate-200/70 bg-white/60">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
            <div className="mb-9 flex items-end justify-between gap-6">
              <div><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-violet-600"><Layers3 className="size-4" /> Arquivo editorial</p><h2 id="editions-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Edições publicadas</h2></div>
              {editions.length > 0 && <p className="text-sm text-slate-500">{editions.length} {editions.length === 1 ? "edição" : "edições"}</p>}
            </div>
            <EditionArchive editions={editions} />
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#17112e] px-6 py-12 text-white shadow-2xl shadow-violet-950/15 sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="absolute right-0 top-0 size-64 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="relative max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-300">Acompanhe o {product.name}</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Esteja por perto desde a primeira edição.</h2><p className="mt-4 text-sm leading-6 text-violet-100/75">Cadastre seu interesse. O envio só será concluído quando a infraestrutura de newsletter estiver disponível.</p></div>
            <Link href={`/${product.channel}/assinar`} className="relative mt-8 inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-violet-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:mt-0">Ir para cadastro <ArrowRight className="size-4" /></Link>
            <Check className="absolute -bottom-8 -right-7 size-40 text-white/[.03]" />
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
