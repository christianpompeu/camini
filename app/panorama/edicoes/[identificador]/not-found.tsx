import Link from "next/link";

export default function PanoramaEditionNotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#fbfbfe] px-5 text-[#101127]"><div className="max-w-md text-center"><p className="text-sm font-semibold text-violet-600">Camini Panorama</p><h1 className="mt-3 text-3xl font-bold tracking-tight">Edição indisponível</h1><p className="mt-4 leading-7 text-slate-600">Esta edição não existe ou ainda não atende a todos os critérios de publicação.</p><Link href="/panorama" className="mt-7 inline-flex min-h-11 items-center rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-violet-700">Voltar ao Panorama</Link></div></main>;
}
