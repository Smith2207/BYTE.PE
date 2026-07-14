"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MovimientoKardex } from "@/lib/kardex/store";

const ETIQUETA_TIPO: Record<MovimientoKardex["tipo"], string> = {
  compra: "Compra",
  venta: "Venta",
  devolucion: "Devolución",
};

export function ExportarCsvBoton({
  movimientos,
  nombreProducto,
}: {
  movimientos: MovimientoKardex[];
  nombreProducto: string;
}) {
  function exportar() {
    const encabezado = "Fecha,Tipo,Documento,Entrada,Salida,Saldo";
    const filas = movimientos.map((m) =>
      [
        new Date(m.fecha).toLocaleDateString("es-PE"),
        ETIQUETA_TIPO[m.tipo],
        m.documento,
        m.entrada,
        m.salida,
        m.saldo,
      ].join(","),
    );
    const csv = [encabezado, ...filas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kardex-${nombreProducto.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={exportar} disabled={movimientos.length === 0}>
      <Download className="size-4" /> Exportar CSV
    </Button>
  );
}
