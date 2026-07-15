"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_SERIE_PRINCIPAL } from "@/lib/chart-colors";
import { formatoPEN } from "@/lib/format";

export type GastoPorMes = { mes: string; etiqueta: string; total: number };

export function GastosChart({ datos }: { datos: GastoPorMes[] }) {
  const hayGastos = datos.some((d) => d.total > 0);

  return (
    <div className="relative h-56 w-full">
      {!hayGastos && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Todavía no hay gastos en este período.
        </p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={datos} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="gastosGradiente" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_SERIE_PRINCIPAL} stopOpacity={0.45} />
              <stop offset="95%" stopColor={CHART_SERIE_PRINCIPAL} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="etiqueta"
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
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
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--foreground)", marginBottom: 4 }}
            formatter={(value) => [formatoPEN(Number(value)), "Gastos"]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke={CHART_SERIE_PRINCIPAL}
            strokeWidth={2}
            fill="url(#gastosGradiente)"
            dot={false}
            activeDot={{ r: 4, stroke: CHART_SERIE_PRINCIPAL, strokeWidth: 2, fill: "var(--card)" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
