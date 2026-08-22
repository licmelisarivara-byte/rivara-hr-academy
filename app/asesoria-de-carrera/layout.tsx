import type { Metadata } from "next";
import { Lato } from "next/font/google";
import CareerHeader from "@/components/CareerHeader";
import CareerFooter from "@/components/CareerFooter";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-lato",
});

const pageUrl = "https://hracademy.rivaraconsultora.com.ar/asesoria-de-carrera";
const description =
  "Armamos tu CV, tu LinkedIn y tu estrategia de búsqueda laboral en Argentina. Asesoría de carrera personalizada con Lic. Melisa Rivara.";
const title = "Asesoría de Carrera y CV Profesional | RIVARA Consultora";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: pageUrl,
    siteName: "RIVARA Consultora",
    title,
    description,
    images: [{ url: "/images/melisa-portrait.jpg", width: 700, height: 840 }],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/images/melisa-portrait.jpg"],
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
