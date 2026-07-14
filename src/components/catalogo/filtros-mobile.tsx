"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FiltrosSidebar } from "@/components/catalogo/filtros-sidebar";
import type { CategoriaConHijas } from "@/lib/mock/repo";

export function FiltrosMobile({
  categorias,
  marcas,
}: {
  categorias: CategoriaConHijas[];
  marcas: string[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 lg:hidden">
          <SlidersHorizontal className="size-4" />
          Filtros
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <FiltrosSidebar categorias={categorias} marcas={marcas} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
