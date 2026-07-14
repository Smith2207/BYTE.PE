"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductoParaKardex } from "@/lib/kardex/store";

export function ProductoSelector({
  productos,
  productoId,
}: {
  productos: ProductoParaKardex[];
  productoId?: string;
}) {
  const router = useRouter();

  return (
    <Select value={productoId} onValueChange={(v) => router.push(`/admin/kardex?producto=${v}`)}>
      <SelectTrigger className="w-full sm:w-80">
        <SelectValue placeholder="Selecciona un producto..." />
      </SelectTrigger>
      <SelectContent>
        {productos.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.nombre} — {p.sku}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
