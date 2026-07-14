import { Star } from "lucide-react";
import { listarResenasPorProducto, promedioCalificacion } from "@/lib/resenas/store";
import { ResenaForm } from "./resena-form";

export async function ResenasSection({
  productoId,
  productoSlug,
}: {
  productoId: string;
  productoSlug: string;
}) {
  const resenas = await listarResenasPorProducto(productoId);
  const { promedio, total } = await promedioCalificacion(productoId);

  return (
    <div className="mt-16">
      <div className="mb-5 flex items-center gap-3">
        <h2 className="font-display text-xl font-bold">Reseñas</h2>
        {total > 0 && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="size-4 fill-accent text-accent" />
            {promedio} ({total})
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {resenas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sé el primero en dejar una reseña.</p>
          ) : (
            resenas.map((r) => (
              <div key={r.id} className="rounded-xl border border-border/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{r.usuarioNombre}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`size-3.5 ${n <= r.calificacion ? "fill-accent text-accent" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.comentario}</p>
              </div>
            ))
          )}
        </div>

        <ResenaForm productoId={productoId} productoSlug={productoSlug} />
      </div>
    </div>
  );
}
