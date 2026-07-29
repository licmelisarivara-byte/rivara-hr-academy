import type { MetadataRoute } from "next";
import { courses } from "@/lib/courses";
import { notes } from "@/lib/notes";

const siteUrl = "https://hracademy.rivaraconsultora.com.ar";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/cursos", "/recursos", "/notas", "/contacto"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const courseRoutes = courses.map((c) => ({
    url: `${siteUrl}/cursos/${c.slug}`,
    lastModified: new Date(),
  }));

  const noteRoutes = notes.map((n) => ({
    url: `${siteUrl}/notas/${n.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...courseRoutes, ...noteRoutes];
}
