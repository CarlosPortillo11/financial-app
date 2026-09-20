import { Amount } from "@/components/shared/amount";
import { Card, CardContent } from "@/components/ui/card";
import type { Totals } from "@/lib/calc";
import { money, pct } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Elemento principal del resumen: cuánto queda y en qué se fue, en una sola barra. */
export function HeroAvailable({ totals }: { totals: Totals }) {
  const { income, fixed, variable, available } = totals;
  const base = Math.max(income, fixed + variable, 1);
  const seg = (n: number) => `${Math.max(0, (n / base) * 100)}%`;
  const negative = available < 0;

  return (
    <Card className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-primary/15 blur-3xl"
      />
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Disponible este mes</span>
          <span
            className={cn(
              "tnum text-4xl font-semibold tracking-tight md:text-5xl",
              negative && "text-destructive",
            )}
          >
            {money(available)}
          </span>
          <span className="text-sm text-muted-foreground">
            {income > 0
              ? `${pct(1 - available / income, 0)} del ingreso ya está comprometido`
              : "Registra un ingreso para ver el reparto"}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
            <div className="bg-primary" style={{ width: seg(fixed) }} title="Gasto fijo" />
            <div className="bg-want" style={{ width: seg(variable) }} title="Gasto variable" />
          </div>
          <dl className="grid grid-cols-3 gap-2 text-sm">
            <Legend color="bg-primary" label="Fijo" value={fixed} />
            <Legend color="bg-want" label="Variable" value={variable} />
            <Legend color="bg-muted-foreground/30" label="Libre" value={Math.max(0, available)} />
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className={cn("size-2 rounded-full", color)} />
        {label}
      </dt>
      <dd>
        <Amount value={value} className="font-medium" />
      </dd>
    </div>
  );
}
