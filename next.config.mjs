/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Vercel Blob: cada store tiene un subdominio propio, ej.
        // "abc123xyz.public.blob.vercel-storage.com".
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
