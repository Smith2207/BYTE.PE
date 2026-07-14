"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_SERIE_PRINCIPAL } from "@/lib/chart-colors";

export type ProductoVendido = { nombre: string; cantidad: number };

export function TopProductosChart({ datos }: { datos: ProductoVendido[] }) {
  if (datos.length === 0) {
    return (
      <p className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        Todavía no hay ventas registradas.
      </p>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={datos}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="nombre"
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={150}
            tickFormatter={(v: string) => (v.length > 22 ? `${v.slice(0, 22)}…` : v)}
          />
          <Tooltip
            cursor={{ fill: "var(--secondary)" }}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--foreground)", marginBottom: 4 }}
            formatter={(value) => [`${value} unid.`, "Vendidos"]}
          />
          <Bar
            dataKey="cantidad"
            fill={CHART_SERIE_PRINCIPAL}
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
