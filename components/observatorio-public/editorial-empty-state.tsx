import { CalendarClock, Sparkles } from "lucide-react";

export function EditorialEmptyState() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-dashed border-violet-200 bg-white px-6 py-12 text-center shadow-[0_20px_70px_-50px_rgba(76,29,149,.45)] sm:px-10">
      <div className="absolute inset-x-1/4 top-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-violet-100 text-violet-700">
        <CalendarClock className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-950">Primeiras edições em preparação</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
        O arquivo público será aberto quando houver edições revisadas, aprovadas e efetivamente publicadas.
      </p>
      <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
        <Sparkles className="size-3.5 text-violet-500" aria-hidden="true" />
        Nenhum rascunho ou edição candidata é exibido aqui
      </p>
    </div>
  );
}
