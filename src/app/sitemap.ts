import type { MetadataRoute } from "next";
import { getCategorias, listarSlugsProductos } from "@/lib/mock/repo";

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

const PAGINAS_ESTATICAS = [
  { path: "/", prioridad: 1, frecuencia: "daily" as const },
  { path: "/productos", prioridad: 0.9, frecuencia: "daily" as const },
  { path: "/libro-de-reclamaciones", prioridad: 0.3, frecuencia: "yearly" as const },
  { path: "/terminos-y-condiciones", prioridad: 0.2, frecuencia: "yearly" as const },
  { path: "/privacidad", prioridad: 0.2, frecuencia: "yearly" as const },
  { path: "/cambios-y-devoluciones", prioridad: 0.2, frecuencia: "yearly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categorias, productos] = await Promise.all([getCategorias(), listarSlugsProductos()]);

  const urlsEstaticas: MetadataRoute.Sitemap = PAGINAS_ESTATICAS.map((p) => ({
    url: `${BASE_URL}${p.path}`,
    changeFrequency: p.frecuencia,
    priority: p.prioridad,
  }));

  const urlsCategorias: MetadataRoute.Sitemap = categorias.flatMap((c) => [
    {
      url: `${BASE_URL}/productos?categoria=${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...c.subcategorias.map((sub) => ({
      url: `${BASE_URL}/productos?categoria=${sub.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]);

  const urlsProductos: MetadataRoute.Sitemap = productos.map((p) => ({
    url: `${BASE_URL}/productos/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...urlsEstaticas, ...urlsCategorias, ...urlsProductos];
}
