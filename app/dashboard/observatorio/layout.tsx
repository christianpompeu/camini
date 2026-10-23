import type { ReactNode } from "react";
import { EditorialHmlSessionProvider } from "@/components/observatorio/editorial-hml-session";

export default function ObservatorioLayout({ children }: { children: ReactNode }) {
  return <EditorialHmlSessionProvider>{children}</EditorialHmlSessionProvider>;
}
