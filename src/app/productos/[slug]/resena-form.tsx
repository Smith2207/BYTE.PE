"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { crearResenaAction } from "./actions";
import { useAbrirAuthModal } from "@/components/auth/use-auth-modal";
import type { ResenaAlmacenada } from "@/lib/resenas/store";

export function ResenaForm({
  productoId,
  productoSlug,
  resenaPropia,
}: {
  productoId: string;
  productoSlug: string;
  resenaPropia: ResenaAlmacenada | null;
}) {
  const router = useRouter();
  const { status } = useSession();
  const abrirAuthModal = useAbrirAuthModal();
  const [calificacion, setCalificacion] = React.useState(5);
  const [comentario, setComentario] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);

  if (status !== "authenticated") {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          <button className="font-medium text-primary hover:underline" onClick={() => abrirAuthModal("login")}>
            Inicia sesión
          </button>{" "}
          para dejar tu reseña.
        </CardContent>
      </Card>
    );
  }

  // Ya dejó una reseña de este producto (una por usuario) — se muestra su
  // estado en vez del formulario, en lugar de dejarlo mandar duplicados
  // que el servidor de todas formas rechazaría.
  if (resenaPropia) {
    const mensaje =
      resenaPropia.estado === "publicada"
        ? "Tu reseña ya está publicada. ¡Gracias por compartir tu experiencia!"
        : resenaPropia.estado === "rechazada"
          ? "Tu reseña no fue publicada porque no cumplió nuestras normas de la comunidad."
          : "Tu reseña quedará visible en cuanto la revisemos.";
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">{mensaje}</CardContent>
      </Card>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await crearResenaAction({ productoId, productoSlug, calificacion, comentario });
      toast.success("¡Gracias! Tu reseña quedará visible en cuanto la aprobemos.");
      setComentario("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo publicar tu reseña");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setCalificacion(n)} aria-label={`${n} estrellas`}>
                <Star
                  className={cn(
                    "size-5",
                    n <= calificacion ? "fill-accent text-accent" : "text-muted-foreground",
                  )}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Cuéntanos qué te pareció el producto..."
            required
            minLength={5}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
          <Button type="submit" disabled={enviando} size="sm">
            Publicar reseña
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
