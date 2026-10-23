import { CheckCircle2, Eye, Link2, Sparkles } from "lucide-react";
import type { PublicProduct } from "@/lib/observatorio/public-content";
import { PublicHeader } from "./public-header";
import { PublicFooter } from "./public-footer";
import { NewsletterSignupForm } from "./newsletter-signup-form";

export function SignupPage({ product }: { product: PublicProduct }) {
  const points = product.channel === "panorama"
    ? ["Relações entre os fatos", "Síntese editorial responsável", "Fontes para aprofundar"]
    : ["Tecnologia sem excesso de ruído", "Sinais de inovação", "Pesquisa e fontes originais"];
  return (
    <div className="min-h-screen overflow-x-clip bg-[linear-gradient(135deg,#fff_0%,#faf9ff_48%,#eef8ff_100%)] text-slate-950">
      <PublicHeader channel={product.channel} />
      <main className="relative w-full max-w-[100vw] overflow-x-clip">
        <div className="pointer-events-none absolute left-[-10rem] top-24 size-[30rem] rounded-full bg-violet-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-[-8rem] top-0 size-[28rem] rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="relative mx-auto grid w-[calc(100%-2.5rem)] max-w-7xl gap-12 py-14 sm:w-full sm:px-8 lg:grid-cols-[1fr_.84fr] lg:items-center lg:py-24">
          <section className="min-w-0 max-w-full overflow-hidden">
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-violet-700"><Sparkles className="size-3.5" /> {product.name} · cadastro de interesse</p>
            <h1 className="mt-7 max-w-3xl text-4xl font-black leading-[.98] tracking-[-.045em] sm:text-5xl lg:text-7xl">Receba o <span className="block text-violet-600 sm:inline">{product.name}</span> com contexto e perspectiva.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{product.description}</p>
            <div className="mt-9 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {points.map((point) => <div key={point} className="flex items-center gap-3 rounded-2xl border border-white bg-white/70 p-4 text-sm font-medium shadow-sm backdrop-blur"><CheckCircle2 className="size-5 shrink-0 text-violet-600" />{point}</div>)}
            </div>
            <div className="mt-10 max-w-full overflow-hidden rounded-[2rem] border border-violet-200/70 bg-white/70 p-6 backdrop-blur sm:p-8">
              <div className="flex items-center gap-3"><Eye className="size-5 text-violet-600" /><h2 className="font-bold">Prévia editorial</h2></div>
              <p className="mt-4 break-words text-sm leading-6 text-slate-600">{product.proposition} As primeiras edições permanecem em preparação e só aparecerão publicamente após revisão, aprovação e publicação formal.</p>
              <div className="mt-5 flex flex-wrap gap-2">{product.themes.map((theme) => <span key={theme} className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">{theme}</span>)}</div>
            </div>
          </section>
          <aside className="min-w-0 max-w-full overflow-hidden" aria-label={`Formulário de interesse no ${product.name}`}><NewsletterSignupForm product={product} /></aside>
        </div>
        <section className="relative mx-auto w-[calc(100%-2.5rem)] max-w-7xl pb-16 sm:w-full sm:px-8 lg:pb-24">
          <div className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-sm leading-6 text-slate-600 shadow-sm"><Link2 className="mt-0.5 size-5 shrink-0 text-violet-600" /><p><strong className="text-slate-950">Sobre a integração:</strong> o cadastro definitivo deverá adotar confirmação de opt-in, deduplicação por e-mail e canal, retirada simples do consentimento, proteção contra abuso e retenção mínima. Esta tela não simula sucesso enquanto esse contrato não estiver implementado.</p></div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
