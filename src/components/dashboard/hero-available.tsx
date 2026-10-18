import { Amount } from "@/components/shared/amount";
import type { DailyAllowance, Totals } from "@/lib/calc";
import { pct } from "@/lib/money";
import { formatDate } from "@/lib/period";
import { cn } from "@/lib/utils";

/** Elemento principal del resumen: cuánto queda y en qué se fue, en una sola barra.
 *  Va desnudo sobre el cristal, no en tarjeta: es el titular de la página. */
export function HeroAvailable({ totals, daily }: { totals: Totals; daily: DailyAllowance | null }) {
  const { income, fixed, variable, spent, available, carryOver } = totals;
  const base = Math.max(income, fixed + variable, 1);
  const seg = (n: number) => `${Math.max(0, (n / base) * 100)}%`;
  const negative = available < 0;

  return (
    <div data-hero className="flex flex-col gap-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="rise flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Disponible este mes</span>
          <Amount
            animate
            value={available}
            className={cn("text-4xl tracking-tight md:text-5xl", negative && "text-destructive")}
          />
          <span className="text-sm text-muted-foreground">
            {income > 0
              ? `${pct(spent / income, 0)} del ingreso ya está comprometido`
              : "Registra un ingreso para ver el reparto"}
          </span>
          {carryOver !== 0 && (
            <span className="text-sm text-muted-foreground">
              Incluye <Amount value={carryOver} signed tone={carryOver < 0 ? "bad" : "good"} />{" "}
              {carryOver < 0 ? "que faltó" : "que sobró"} en meses anteriores
            </span>
          )}
        </div>
        {daily && <DailyTile daily={daily} />}
      </div>

      <div className="rise flex flex-col gap-3" style={{ "--i": 1 } as React.CSSProperties}>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-foreground/10">
          <div className="grow-x bg-primary" style={{ width: seg(fixed) }} title="Gasto fijo" />
          <div className="grow-x bg-want" style={{ width: seg(variable), "--i": 1 } as React.CSSProperties} title="Gasto variable" />
        </div>
        <dl className="grid grid-cols-3 gap-2 text-sm">
          <Legend color="bg-primary" label="Fijo" value={fixed} />
          <Legend color="bg-want" label="Variable" value={variable} />
          <Legend color="bg-foreground/20" label="Libre" value={Math.max(0, available)} />
        </dl>
      </div>
    </div>
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

function DailyTile({ daily }: { daily: DailyAllowance }) {
  const empty = daily.amount === 0;
  return (
    <div className="tile rise flex flex-col gap-1 rounded-2xl px-5 py-4 md:min-w-64">
      <span className="text-sm text-muted-foreground">Hoy puedes gastar</span>
      <Amount animate value={daily.amount} className={cn("text-3xl tracking-tight", empty && "text-destructive")} />
      <span className="text-xs text-muted-foreground">
        {empty
          ? `No queda margen hasta tu pago del ${formatDate(daily.until)}`
          : `al día durante ${daily.days} ${daily.days === 1 ? "día" : "días"}, hasta tu pago del ${formatDate(daily.until)}`}
      </span>
    </div>
  );
}
