/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        // Vercel Blob: cada store tiene un subdominio propio, ej.
        // "abc123xyz.public.blob.vercel-storage.com".
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // Vercel no agrega estas cabeceras por defecto — sin ellas el sitio
  // queda expuesto a clickjacking (falta X-Frame-Options), MIME sniffing
  // (falta X-Content-Type-Options) y fuga de la URL completa al navegar a
  // sitios externos (falta Referrer-Policy). No se agrega CSP porque el
  // sitio depende de scripts inline (GSAP/Framer Motion) y de dominios de
  // terceros (Google OAuth, Mercado Pago) que romperían con una política
  // estricta sin un trabajo de auditoría de cada script — mejor no tener
  // CSP que tener una tan laxa que no proteja nada.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
