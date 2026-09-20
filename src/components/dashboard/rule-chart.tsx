"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { TypeSummary } from "@/lib/calc";
import { money } from "@/lib/money";

const config = {
  target: { label: "Meta", color: "var(--muted-foreground)" },
  actual: { label: "Real", color: "var(--primary)" },
} satisfies ChartConfig;

export function RuleChart({ byType }: { byType: TypeSummary[] }) {
  const data = byType.map((t) => ({
    name: t.label,
    target: t.target,
    actual: t.actual,
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Real vs. meta</CardTitle>
        <CardDescription>Distribución del gasto frente a la regla 50/30/20.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-56 w-full">
          <BarChart data={data} barGap={4}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
            />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(v) => money(Number(v))} />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="target" fill="var(--color-target)" radius={6} fillOpacity={0.35} />
            <Bar dataKey="actual" fill="var(--color-actual)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
