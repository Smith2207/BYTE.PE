"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_SERIE_PRINCIPAL } from "@/lib/chart-colors";
import { formatoPEN } from "@/lib/format";

export type PuntoTendencia = { etiqueta: string; valor: number };

/** Base compartida para los gráficos de tendencia del dashboard admin
 * (Ventas, Gastos) — antes eran dos componentes casi idénticos copiados
 * uno del otro; acá solo cambia qué datos entran. El formato de valor es
 * siempre soles (formatoPEN) — no se recibe como prop función porque este
 * componente es "use client" y sus callers son Server Components (las
 * funciones no se pueden pasar por el límite server→client de RSC). */
export function TrendAreaChart({
  datos,
  gradientId,
  tooltipLabel,
  mensajeVacio,
  compactarEjeX = false,
}: {
  datos: PuntoTendencia[];
  /** Único por gráfico — dos <linearGradient> con el mismo id en la misma página se pisan. */
  gradientId: string;
  tooltipLabel: string;
  mensajeVacio: string;
  /** Para series largas (ej. 14 días) — evita que se amontonen las etiquetas del eje X. */
  compactarEjeX?: boolean;
}) {
  const hayDatos = datos.some((d) => d.valor > 0);

  return (
    <div className="relative h-56 w-full">
      {!hayDatos && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          {mensajeVacio}
        </p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={datos} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
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
            interval={compactarEjeX ? "preserveStartEnd" : undefined}
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
            formatter={(value) => [formatoPEN(Number(value)), tooltipLabel]}
          />
          <Area
            type="monotone"
            dataKey="valor"
            stroke={CHART_SERIE_PRINCIPAL}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, stroke: CHART_SERIE_PRINCIPAL, strokeWidth: 2, fill: "var(--card)" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
