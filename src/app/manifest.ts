import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.nombre} — Electrónica y tecnología en Perú`,
    short_name: siteConfig.nombre,
    description: siteConfig.descripcion,
    start_url: "/",
    display: "standalone",
    background_color: "#0d0d0d",
    theme_color: "#0d0d0d",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
    ],
  };
}
