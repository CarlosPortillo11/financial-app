import { Amount } from "@/components/shared/amount";
import { Card, CardContent } from "@/components/ui/card";
import type { BiweekSummary, Totals } from "@/lib/calc";
import { cn } from "@/lib/utils";

export function KpiCards({ totals }: { totals: Totals }) {
  const items = [
    { label: "Ingresos", value: totals.income },
    { label: "Gasto fijo", value: totals.fixed },
    { label: "Gasto variable", value: totals.variable },
    { label: "Total gastado", value: totals.spent },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((k) => (
        <Card key={k.label} size="sm">
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{k.label}</span>
            <Amount value={k.value} className="text-lg font-semibold tracking-tight" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function BiweekCards({ biweeks }: { biweeks: BiweekSummary[] }) {
  return (
    <>
      {biweeks.map((q) => (
        <Card key={q.biweek} size="sm">
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="font-medium">Quincena {q.biweek}</span>
              <span className="text-xs text-muted-foreground">
                {q.range}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <Row label="Ingreso" value={q.income} />
              <Row label="Gasto fijo" value={q.fixed} />
              <Row label="Gasto variable" value={q.variable} />
              <Row label="Disponible" value={q.available} strong />
            </dl>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <>
      <dt className={cn("text-muted-foreground", strong && "font-medium text-foreground")}>
        {label}
      </dt>
      <dd className="text-right">
        <Amount
          value={value}
          className={cn(strong && "font-semibold", strong && value < 0 && "text-destructive")}
        />
      </dd>
    </>
  );
}
