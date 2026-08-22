import type { Metadata } from "next";
import { Lato } from "next/font/google";
import CareerHeader from "@/components/CareerHeader";
import CareerFooter from "@/components/CareerFooter";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-lato",
});

const pageUrl = "https://carrera.rivaraconsultora.com.ar";
const description =
  "Armamos tu CV, tu LinkedIn y tu estrategia de búsqueda laboral en Argentina. Asesoría de carrera personalizada con Lic. Melisa Rivara.";
const title = "Asesoría de Carrera y CV Profesional | RIVARA Consultora";

export const metadata: Metadata = {
  metadataBase: new URL(pageUrl),
  title: { absolute: title },
  description,
  keywords: [
    "asesoría de carrera",
    "armado de CV",
    "CV profesional Argentina",
    "optimización de LinkedIn",
    "búsqueda laboral Argentina",
    "CV ATS",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: pageUrl,
    siteName: "RIVARA Consultora",
    title,
    description,
    images: [{ url: "/images/asesoria/hero-cv-2.jpg", width: 1696, height: 2106 }],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/images/asesoria/hero-cv-2.jpg"],
  },
};

export default function AsesoriaCarreraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${lato.variable} font-body bg-careerCream text-careerNavy min-h-screen`}>
      <CareerHeader />
      <main>{children}</main>
      <CareerFooter />
    </div>
  );
}
