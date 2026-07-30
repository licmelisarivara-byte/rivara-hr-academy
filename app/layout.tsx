import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const siteUrl = "https://hracademy.rivaraconsultora.com.ar";
const siteDescription =
  "Cursos y recursos de IA para selección de personal: armá tu asistente de selección con IA, tu propio ATS, y aplicá prompts listos para RRHH. Por Lic. Melisa Rivara.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RIVARA HR Academy | Cursos de IA para Selección de Personal",
    template: "%s | RIVARA HR Academy",
  },
  description: siteDescription,
  keywords: [
    "cursos de IA para selección de personal",
    "IA para RRHH",
    "asistente de selección con IA",
    "ATS con inteligencia artificial",
    "prompts para selección de personal",
    "reclutamiento con IA",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: "RIVARA HR Academy",
    title: "RIVARA HR Academy | Cursos de IA para Selección de Personal",
    description: siteDescription,
    images: [{ url: "/images/logo-horizontal.png", width: 640, height: 162 }],
  },
  twitter: {
    card: "summary",
    title: "RIVARA HR Academy | Cursos de IA para Selección de Personal",
    description: siteDescription,
    images: ["/images/logo-horizontal.png"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "RIVARA HR Academy",
  url: siteUrl,
  logo: `${siteUrl}/images/logo-horizontal.png`,
  description: siteDescription,
  founder: {
    "@type": "Person",
    name: "Melisa Rivara",
  },
  sameAs: [
    "https://www.instagram.com/lic.melisarivara/",
    "https://www.facebook.com/Recursoshumanosydigitalizacion",
    "https://www.linkedin.com/company/rivara-consultora",
    "http://www.youtube.com/@recursoshumanosydigitalizacion",
  ],
};

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        {gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}');
              `}
            </Script>
          </>
        )}
        <Nav />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
