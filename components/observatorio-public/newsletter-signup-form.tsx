"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Check, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PublicProduct } from "@/lib/observatorio/public-content";

type Errors = Partial<Record<"name" | "email" | "consent", string>>;

function validate(form: HTMLFormElement): Errors {
  const data = new FormData(form);
  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const consent = data.get("consent") === "on";
  const errors: Errors = {};
  if (name.length < 2) errors.name = "Informe seu nome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Informe um e-mail válido.";
  if (!consent) errors.consent = "O consentimento é necessário para receber comunicações.";
  return errors;
}

export function NewsletterSignupForm({ product }: { product: PublicProduct }) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "validating" | "unavailable">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("validating");
    const nextErrors = validate(event.currentTarget);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("idle");
      return;
    }
    setStatus("unavailable");
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_30px_90px_-45px_rgba(55,20,130,.4)] sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700"><Mail className="size-5" /></span>
        <div><h2 className="text-2xl font-bold tracking-tight">Acompanhe o {product.name}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{product.subscribeDescription}</p></div>
      </div>
      <div className="mt-7 space-y-5">
        <Input name="name" id={`${product.channel}-name`} autoComplete="name" label="Nome" placeholder="Como podemos chamar você?" error={errors.name} aria-invalid={Boolean(errors.name)} />
        <Input name="email" id={`${product.channel}-email`} autoComplete="email" type="email" label="E-mail" placeholder="voce@exemplo.com" error={errors.email} aria-invalid={Boolean(errors.email)} />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">Canal selecionado</p>
          <p className="mt-2 flex items-center gap-2 font-semibold text-slate-950"><Check className="size-4 text-violet-600" /> {product.name}</p>
          <input type="hidden" name="channel" value={product.channel} />
        </div>
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-700">
            <input name="consent" type="checkbox" className="mt-1 size-4 rounded border-slate-300 accent-violet-600 focus-visible:ring-2 focus-visible:ring-violet-500" aria-invalid={Boolean(errors.consent)} />
            <span>Concordo em receber comunicações editoriais do Camini neste e-mail. Poderei retirar meu consentimento a qualquer momento.</span>
          </label>
          {errors.consent && <p className="mt-2 text-xs font-medium text-red-600">{errors.consent}</p>}
        </div>
        <Button type="submit" size="lg" fullWidth variant="energy" disabled={status === "validating"} className="rounded-xl bg-[linear-gradient(135deg,#5423e7,#7c3aed)]">
          {status === "validating" ? <LoaderCircle className="size-4 animate-spin" /> : <>Validar cadastro <ArrowRight className="size-4" /></>}
        </Button>
        {status === "unavailable" && (
          <div role="status" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <p><strong>Dados válidos, envio ainda indisponível.</strong><br />A integração de newsletter deste canal ainda não foi autorizada. Nenhum dado foi armazenado.</p>
          </div>
        )}
      </div>
      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 size-4 shrink-0" /> Seus dados não são enviados enquanto a integração segura e a política de privacidade deste cadastro não estiverem disponíveis.</p>
    </form>
  );
}
