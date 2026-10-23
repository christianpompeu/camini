import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EditionNotFound() {
  return <Card variant="outline"><CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center"><FileQuestion className="mb-3 size-9 text-muted-foreground/50" /><h1 className="text-xl font-semibold">Edição não encontrada</h1><p className="mt-2 max-w-md text-sm text-muted-foreground">A edição não existe no HML autorizado ou não está disponível para esta sessão.</p><Link href="/dashboard/observatorio/edicoes" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><ArrowLeft className="size-4" />Voltar para a fila</Link></CardContent></Card>;
}
