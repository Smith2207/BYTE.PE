import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Genera un componente de badge de estado a partir de sus mapas de
 * color/glow/etiqueta — antes cada dominio (Pedidos, Reclamos,
 * Devoluciones) repetía la misma lógica de componente (Badge + cn() +
 * prop "neon"), solo cambiaban los mapas. Los mapas se quedan en el
 * archivo de cada dominio (son datos propios, con su propio enum), esto
 * solo evita repetir el componente en sí.
 */
export function crearBadgeDeEstado<T extends string>(config: {
  estilos: Record<T, string>;
  glows: Record<T, string>;
  etiquetas: Record<T, string>;
}) {
  return function EstadoBadge({ estado, neon = false }: { estado: T; neon?: boolean }) {
    return (
      <Badge variant="outline" className={cn(config.estilos[estado], neon && config.glows[estado])}>
        {config.etiquetas[estado]}
      </Badge>
    );
  };
}
