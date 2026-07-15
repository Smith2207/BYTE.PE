"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { FileText, Paperclip, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";

function esPdf(url: string) {
  return url.toLowerCase().endsWith(".pdf");
}

export function ComprobanteUploader({
  urls,
  onChange,
  max,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
  /** Si se define, oculta el botón de subir cuando ya se llegó al límite (ej. max={1} para un solo comprobante). */
  max?: number;
}) {
  const [subiendo, setSubiendo] = React.useState(false);
  const [arrastrando, setArrastrando] = React.useState(false);
  const alcanzoElMaximo = max != null && urls.length >= max;

  async function subirArchivos(archivos: FileList | File[]) {
    setSubiendo(true);
    try {
      const nuevas: string[] = [];
      for (const archivo of Array.from(archivos)) {
        const formData = new FormData();
        formData.append("archivo", archivo);
        formData.append("tipo", "documento");
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? `No se pudo subir "${archivo.name}"`);
          continue;
        }
        nuevas.push(data.url);
      }
      if (nuevas.length > 0) {
        const combinadas = [...urls, ...nuevas];
        onChange(max != null ? combinadas.slice(-max) : combinadas);
      }
    } finally {
      setSubiendo(false);
    }
  }

  function quitar(url: string) {
    onChange(urls.filter((u) => u !== url));
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        {urls.map((url) => (
          <div
            key={url}
            className="group relative flex size-24 flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary"
          >
            {esPdf(url) ? (
              <Link
                href={url}
                target="_blank"
                className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground"
              >
                <FileText className="size-6" />
                <span className="text-[10px]">PDF</span>
              </Link>
            ) : (
              <Image src={url} alt="" fill sizes="96px" className="object-cover" />
            )}
            <button
              type="button"
              onClick={() => quitar(url)}
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-background-80 text-foreground opacity-0 transition group-hover:opacity-100"
              aria-label="Quitar comprobante"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {!alcanzoElMaximo && (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastrando(false);
              if (e.dataTransfer.files.length) void subirArchivos(e.dataTransfer.files);
            }}
            className={cn(
              "flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted-foreground transition hover:border-primary/50 hover:text-foreground",
              arrastrando && "border-primary/60 bg-secondary",
            )}
          >
            {subiendo ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <Paperclip className="size-5" />
                <span className="text-[10px]">Subir</span>
              </>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
              multiple={max !== 1}
              className="hidden"
              disabled={subiendo}
              onChange={(e) => {
                if (e.target.files?.length) void subirArchivos(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Fotos o PDF de la factura/voucher — máx. 10MB por archivo.
      </p>
    </div>
  );
}
