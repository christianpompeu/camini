import type { CanalObservatorio } from "./types";

export type PublicProduct = {
  channel: CanalObservatorio;
  name: string;
  eyebrow: string;
  headline: string;
  description: string;
  proposition: string;
  subscribeDescription: string;
  features: Array<{ title: string; description: string }>;
  themes: string[];
};

export const publicProducts: Record<CanalObservatorio, PublicProduct> = {
  panorama: {
    channel: "panorama",
    name: "Panorama",
    eyebrow: "Seu briefing com perspectiva",
    headline: "Contexto para entender o que realmente importa.",
    description:
      "Uma leitura editorial que conecta acontecimentos, tendências e sinais para ir além do fato isolado.",
    proposition:
      "Menos ruído, mais relações entre os fatos e clareza para acompanhar o cenário.",
    subscribeDescription:
      "Receba o Panorama quando a entrega editorial estiver disponível para novos leitores.",
    features: [
      { title: "Curadoria inteligente", description: "Seleção editorial concentrada no que merece atenção." },
      { title: "Contexto e conexões", description: "Relações entre acontecimentos, sem atalhos causais." },
      { title: "Leitura executiva", description: "Síntese clara, responsável e fácil de acompanhar." },
    ],
    themes: ["Política", "Economia", "Geopolítica", "Sociedade", "Clima"],
  },
  tech: {
    channel: "tech",
    name: "Tech",
    eyebrow: "Tecnologia com contexto",
    headline: "O futuro, explicado sem o ruído.",
    description:
      "Análises sobre tecnologia e inovação para compreender o presente e acompanhar o que vem pela frente.",
    proposition:
      "Sinais relevantes de tecnologia, examinados com profundidade e perspectiva.",
    subscribeDescription:
      "Receba o Tech quando a entrega editorial estiver disponível para novos leitores.",
    features: [
      { title: "Curadoria especializada", description: "O que importa em inovação, pesquisa e produtos." },
      { title: "Sinais emergentes", description: "Movimentos que ajudam a antecipar mudanças." },
      { title: "Fontes e pesquisa", description: "Referências para aprofundar cada leitura." },
    ],
    themes: ["IA", "Software", "Pesquisa", "Segurança", "Startups"],
  },
};
