import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0a0f 0%, #17171f 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: -2,
            display: "flex",
          }}
        >
          {siteConfig.nombre}
        </div>
        <div style={{ fontSize: 32, marginTop: 24, color: "#a1a1aa", display: "flex" }}>
          {siteConfig.descripcion}
        </div>
      </div>
    ),
    { ...size },
  );
}
