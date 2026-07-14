import Link from "next/link";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VentasChart, type VentaPorDia } from "@/components/admin/ventas-chart";
import { TopProductosChart } from "@/components/admin/top-productos-chart";
import { adminListarProductos } from "@/lib/mock/repo";
import { listarPedidos, getVariacionUltimos30Dias } from "@/lib/pedidos/store";
import { getResumenCompras } from "@/lib/compras/store";
import { formatoPEN } from "@/lib/format";

export const metadata = { title: "Admin — Dashboard" };

function VariacionIndicador({ valor }: { valor: number | null }) {
  if (valor === null) return null;
  const positivo = valor >= 0;
  const Icono = positivo ? ArrowUp : ArrowDown;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        positivo ? "text-emerald-500" : "text-red-500"
      }`}
    >
      <Icono className="size-3" />
      {Math.abs(valor)}%
    </span>
  );
}

export default async function AdminDashboardPage() {
  const pedidos = await listarPedidos();
  const productos = await adminListarProductos();
  const resumenCompras = await getResumenCompras();
  const variacion = await getVariacionUltimos30Dias();

  const pedidosValidos = pedidos.filter((p) => p.estado !== "cancelado");
  const ventasTotales = pedidosValidos.reduce((acc, p) => acc + p.total, 0);
  const pedidosPendientes = pedidos.filter((p) => p.estado === "pendiente").length;
  const stockBajo = productos.filter((p) => p.activo && p.stock > 0 && p.stock <= 5);
  const agotados = productos.filter((p) => p.activo && p.stock === 0);

  // Margen bruto: ingresos por PRODUCTOS (subtotal, sin IGV ni envío —
  // ninguno de los dos es ganancia: el IGV se lo queda SUNAT y el envío
  // cubre el costo del courier) menos el costo de adquisición de lo
  // vendido. Se aproxima con el costo ACTUAL del producto (promedio
  // ponderado tras cada compra recibida), no un histórico por pedido —
  // suficiente para una vista general de rentabilidad.
  const ingresosPorProductos = pedidosValidos.reduce((acc, p) => acc + (p.subtotal - p.igv), 0);
  const costoPorProductoId = new Map(productos.map((p) => [p.id, p.costoAdquisicion]));
  let costoVentas = 0;
  let unidadesConCosto = 0;
  for (const pedido of pedidosValidos) {
    for (const item of pedido.items) {
      const costo = costoPorProductoId.get(item.productoId);
      if (costo != null) {
        costoVentas += costo * item.cantidad;
        unidadesConCosto += item.cantidad;
      }
    }
  }
  const margenBruto = ingresosPorProductos - costoVentas;
  const margenPorcentaje =
    ingresosPorProductos > 0 ? Math.round((margenBruto / ingresosPorProductos) * 100) : 0;

  const conteoVentasPorProducto = new Map<string, number>();
  for (const pedido of pedidos) {
    for (const item of pedido.items) {
      conteoVentasPorProducto.set(
        item.nombreProducto,
        (conteoVentasPorProducto.get(item.nombreProducto) ?? 0) + item.cantidad,
      );
    }
  }
  const masVendidos = Array.from(conteoVentasPorProducto.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }));

  // Ventas por día, últimos 14 días (incluye días en cero para que la
  // tendencia se lea bien, no solo los días con pedidos).
  const ventasPorFecha = new Map<string, number>();
  for (const pedido of pedidosValidos) {
    const fecha = pedido.createdAt.slice(0, 10);
    ventasPorFecha.set(fecha, (ventasPorFecha.get(fecha) ?? 0) + pedido.total);
  }
  const ventasPorDia: VentaPorDia[] = Array.from({ length: 14 }, (_, i) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - (13 - i));
    const iso = fecha.toISOString().slice(0, 10);
    return {
      fecha: iso,
      etiqueta: fecha.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" }),
      ventas: ventasPorFecha.get(iso) ?? 0,
    };
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <DollarSign className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ventas totales</p>
              <p className="flex items-center gap-2 text-lg font-bold">
                {formatoPEN(ventasTotales)}
                <VariacionIndicador valor={variacion.ventas} />
              </p>
              {variacion.ventas !== null && (
                <p className="text-[11px] text-muted-foreground">vs. 30 días anteriores</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <ShoppingCart className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pedidos</p>
              <p className="flex items-center gap-2 text-lg font-bold">
                {pedidos.length}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({pedidosPendientes} pendientes)
                </span>
                <VariacionIndicador valor={variacion.pedidos} />
              </p>
              {variacion.pedidos !== null && (
                <p className="text-[11px] text-muted-foreground">vs. 30 días anteriores</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stock bajo / agotado</p>
              <p className="text-lg font-bold">
                {stockBajo.length} / {agotados.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Contabilidad (solo admin)
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Margen bruto estimado</p>
                <p className="text-lg font-bold">
                  {formatoPEN(margenBruto)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({margenPorcentaje}%)
                  </span>
                </p>
                {unidadesConCosto === 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Sin costo de adquisición cargado todavía
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <DollarSign className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Invertido en compras</p>
                <p className="text-lg font-bold">{formatoPEN(resumenCompras.costoTotalCompras)}</p>
                <p className="text-[11px] text-muted-foreground">
                  {resumenCompras.totalCompras} compra(s) registradas
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground">
                <Truck className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Compras en tránsito</p>
                <p className="text-lg font-bold">{resumenCompras.comprasEnTransito}</p>
                <Link href="/admin/compras" className="text-[11px] text-primary hover:underline">
                  Ver compras
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-sm font-semibold">Ventas — últimos 14 días</h2>
          <VentasChart datos={ventasPorDia} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 text-sm font-semibold">Productos más vendidos</h2>
            <TopProductosChart datos={masVendidos} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Package className="size-4" /> Alerta de stock
            </h2>
            {stockBajo.length === 0 && agotados.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todo el stock está saludable.</p>
            ) : (
              <ul className="space-y-2">
                {[...agotados, ...stockBajo].slice(0, 6).map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <Link href={`/admin/productos?editar=${p.id}`} className="hover:underline">
                      {p.nombre}
                    </Link>
                    <Badge variant={p.stock === 0 ? "destructive" : "secondary"}>
                      {p.stock === 0 ? "Agotado" : `${p.stock} unid.`}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
