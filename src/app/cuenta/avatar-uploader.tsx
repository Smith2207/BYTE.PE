"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { actualizarAvatarAction } from "./actions";

export function AvatarUploader({
  imagen,
  iniciales,
  nombre,
}: {
  imagen: string | null;
  iniciales: string;
  nombre: string;
}) {
  const router = useRouter();
  const [subiendo, setSubiendo] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      const res = await fetch("/api/perfil/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo subir la imagen");
        return;
      }
      await actualizarAvatarAction(data.url);
      toast.success("Foto de perfil actualizada");
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar la foto de perfil");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={subiendo}
      className="group relative size-16 shrink-0 overflow-hidden rounded-full"
      aria-label="Cambiar foto de perfil"
    >
      <Avatar className="size-16">
        {imagen && <AvatarImage src={imagen} alt={nombre} />}
        <AvatarFallback className="text-lg font-semibold">{iniciales}</AvatarFallback>
      </Avatar>
      <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
        {subiendo ? (
          <Loader2 className="size-5 animate-spin text-white" />
        ) : (
          <Camera className="size-5 text-white" />
        )}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        disabled={subiendo}
        onChange={onFileChange}
      />
    </button>
  );
}
