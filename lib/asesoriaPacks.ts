export type AsesoriaPack = {
  slug: string;
  title: string;
  priceARS: number;
  originalPriceARS: number;
  popular?: boolean;
  items: string[];
};

export const ASESORIA_PACKS: AsesoriaPack[] = [
  {
    slug: "inicio",
    title: "Pack Inicio",
    priceARS: 75000,
    originalPriceARS: 95000,
    items: ["CV ATS", "CV con foto", "Optimización de LinkedIn"],
  },
  {
    slug: "completo-es",
    title: "Pack Completo Español",
    priceARS: 140000,
    originalPriceARS: 280000,
    popular: true,
    items: [
      "CV ATS",
      "CV con foto",
      "LinkedIn completo",
      "Informe de Estrategia Laboral",
      "Entrevista simulada",
      "Asesoría 60 min",
    ],
  },
  {
    slug: "completo-bilingue",
    title: "Pack Completo Bilingüe",
    priceARS: 175000,
    originalPriceARS: 385000,
    items: ["Todo el Pack Completo, en español e inglés (ES+EN)"],
  },
  {
    slug: "premium",
    title: "Pack Premium Ejecutivo",
    priceARS: 220000,
    originalPriceARS: 435000,
    items: ["Todo el Pack Bilingüe", "Seguimiento de 30 días por WhatsApp"],
  },
];

export const ASESORIA_ADDON_TRADUCCION = {
  slug: "traduccion-en",
  title: "Traducción al inglés",
  priceARS: 15000,
};

export function getAsesoriaPack(slug: string): AsesoriaPack | undefined {
  return ASESORIA_PACKS.find((p) => p.slug === slug);
}
