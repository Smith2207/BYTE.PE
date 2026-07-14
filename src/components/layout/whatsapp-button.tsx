import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function WhatsappButton() {
  const mensaje = encodeURIComponent("Hola, tengo una consulta sobre un producto de BYTE.PE");
  const href = `https://wa.me/${siteConfig.whatsapp}?text=${mensaje}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95 print:hidden"
    >
      <span className="absolute inset-0 animate-pulse-glow rounded-full bg-[#25D366]/50 blur-md" />
      <MessageCircle className="relative size-7 fill-white text-white" />
    </a>
  );
}
