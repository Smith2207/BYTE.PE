"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";

export function ImagenUploader({
  imagenes,
  onChange,
}: {
  imagenes: string[];
  onChange: (imagenes: string[]) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = React.useState(false);
  const [arrastrando, setArrastrando] = React.useState(false);

  async function subirArchivos(archivos: FileList | File[]) {
    setSubiendo(true);
    try {
      const nuevas: string[] = [];
      for (const archivo of Array.from(archivos)) {
        const formData = new FormData();
        formData.append("archivo", archivo);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? `No se pudo subir "${archivo.name}"`);
          continue;
        }
        nuevas.push(data.url);
      }
      if (nuevas.length > 0) onChange([...imagenes, ...nuevas]);
    } finally {
      setSubiendo(false);
    }
  }

  function quitar(url: string) {
    onChange(imagenes.filter((i) => i !== url));
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        {imagenes.map((url) => (
          <div
            key={url}
            className="group relative size-24 overflow-hidden rounded-xl border border-border bg-secondary"
          >
            <Image src={url} alt="" fill sizes="96px" className="object-cover" />
            <button
              type="button"
              onClick={() => quitar(url)}
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-background-80 text-foreground opacity-0 transition group-hover:opacity-100"
              aria-label="Quitar imagen"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

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
              <ImagePlus className="size-5" />
              <span className="text-[10px]">Subir</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            multiple
            className="hidden"
            disabled={subiendo}
            onChange={(e) => {
              if (e.target.files?.length) void subirArchivos(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">JPG, PNG, GIF o WEBP — máx. 5MB por imagen.</p>
    </div>
  );
}
