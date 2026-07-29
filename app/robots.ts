import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/login", "/registro"],
      },
    ],
    sitemap: "https://hracademy.rivaraconsultora.com.ar/sitemap.xml",
  };
}
