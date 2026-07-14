import { Truck } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { Magnetic } from "@/components/fx/magnetic";
import { listarCouriers, listarTarifasCourier } from "@/lib/couriers/store";
import { CourierDialog } from "./courier-dialog";
import { TarifasSheet } from "./tarifas-sheet";
import { ToggleActivoCourier, EliminarCourierBoton } from "./eliminar-boton";

export const metadata = { title: "Admin — Couriers" };

export default async function AdminCouriersPage() {
  const couriers = await listarCouriers();
  const tarifasPorCourier = await Promise.all(
    couriers.map((c) => listarTarifasCourier(c.id)),
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Couriers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Couriers de reparto local y sus tarifas propias por departamento.
          </p>
        </div>
        <Magnetic strength={0.15} className="inline-block">
          <CourierDialog />
        </Magnetic>
      </div>

      {couriers.length === 0 ? (
        <RevealOnScroll className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <Truck className="size-10 text-muted-foreground" />
          <p className="mt-4 text-sm font-semibold">Todavía no registraste couriers</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Agrega los couriers con los que trabajas (Olva, Shalom...) para elegirlos al despachar
            un pedido en vez de escribir el nombre cada vez.
          </p>
        </RevealOnScroll>
      ) : (
        <RevealOnScroll y={16} className="overflow-hidden rounded-2xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tarifas</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {couriers.map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.nombre}
                    {!c.trackingUrlPattern && (
                      <p className="text-xs font-normal text-muted-foreground">
                        Sin URL de tracking
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <TarifasSheet courier={c} tarifas={tarifasPorCourier[i]} />
                  </TableCell>
                  <TableCell>
                    <ToggleActivoCourier id={c.id} activo={c.activo} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <CourierDialog courier={c} />
                      <EliminarCourierBoton id={c.id} nombre={c.nombre} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </RevealOnScroll>
      )}
    </div>
  );
}
