"use client";

export default function EditionError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6"><h1 className="text-lg font-semibold">Não foi possível carregar a edição</h1><p className="mt-2 text-sm text-muted-foreground">A leitura privada encontrou um erro temporário.</p><button type="button" onClick={() => reset()} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Tentar novamente</button></div>;
}
