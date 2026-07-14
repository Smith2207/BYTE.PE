"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_SERIE_PRINCIPAL } from "@/lib/chart-colors";
import { formatoPEN } from "@/lib/format";

export type VentaPorDia = { fecha: string; etiqueta: string; ventas: number };

export function VentasChart({ datos }: { datos: VentaPorDia[] }) {
  const hayVentas = datos.some((d) => d.ventas > 0);

  return (
    <div className="relative h-56 w-full">
      {!hayVentas && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Todavía no hay ventas en este período.
        </p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="etiqueta"
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={36}
            tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
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
            formatter={(value) => [formatoPEN(Number(value)), "Ventas"]}
          />
          <Bar
            dataKey="ventas"
            fill={CHART_SERIE_PRINCIPAL}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
