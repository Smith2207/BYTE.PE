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

export function ResenaForm({ productoId, productoSlug }: { productoId: string; productoSlug: string }) {
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await crearResenaAction({ productoId, productoSlug, calificacion, comentario });
      toast.success("¡Gracias por tu reseña!");
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
