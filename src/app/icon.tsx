import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// Ícono generado en código (sin depender de un logo/PNG que no existe en
// el proyecto) — mismo fondo oscuro #0d0d0d usado como color de marca en
// las plantillas de correo. Sirve tanto de favicon como de ícono de PWA
// (referenciado desde manifest.ts).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d0d",
          borderRadius: 96,
          color: "#ffffff",
          fontSize: 320,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        B
      </div>
    ),
    { ...size },
  );
}
