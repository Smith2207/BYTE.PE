import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PaginacionAdmin({
  paginaActual,
  totalPaginas,
  basePath,
  searchParams,
}: {
  paginaActual: number;
  totalPaginas: number;
  basePath: string;
  /** Params actuales (q, estado, etc.) a preservar al cambiar de página. */
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPaginas <= 1) return null;

  function hrefPagina(pagina: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "pagina") params.set(k, v);
    }
    if (pagina > 1) params.set("pagina", String(pagina));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Página {paginaActual} de {totalPaginas}
      </span>
      <div className="flex gap-2">
        {paginaActual <= 1 ? (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="size-4" /> Anterior
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href={hrefPagina(paginaActual - 1)}>
              <ChevronLeft className="size-4" /> Anterior
            </Link>
          </Button>
        )}
        {paginaActual >= totalPaginas ? (
          <Button variant="outline" size="sm" disabled>
            Siguiente <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href={hrefPagina(paginaActual + 1)}>
              Siguiente <ChevronRight className="size-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
