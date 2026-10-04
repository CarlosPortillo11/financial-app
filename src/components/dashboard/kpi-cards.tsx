import { BanknoteIcon, RepeatIcon, ShoppingBagIcon, WalletIcon } from "lucide-react";
import { Amount } from "@/components/shared/amount";
import { Bento, BentoTile } from "@/components/shared/bento";
import type { BiweekSummary, Totals } from "@/lib/calc";
import { cn } from "@/lib/utils";

/** Bento del resumen: cuatro KPIs de una columna y las dos quincenas de dos. */
export function DashboardBento({ totals, biweeks }: { totals: Totals; biweeks: BiweekSummary[] }) {
  const kpis = [
    { label: "Ingresos", value: totals.income, icon: BanknoteIcon },
    { label: "Gasto fijo", value: totals.fixed, icon: RepeatIcon },
    { label: "Gasto variable", value: totals.variable, icon: ShoppingBagIcon },
    { label: "Total gastado", value: totals.spent, icon: WalletIcon },
  ];
  return (
    <Bento>
      {kpis.map((k, i) => (
        <BentoTile key={k.label} index={i} className="justify-between">
          <span className="flex size-9 items-center justify-center rounded-xl bg-card text-muted-foreground">
            <k.icon className="size-4.5" strokeWidth={1.5} />
          </span>
          <span className="mt-3 flex flex-col gap-0.5">
            <Amount value={k.value} className="text-2xl tracking-tight" />
            <span className="text-sm text-muted-foreground">{k.label}</span>
          </span>
        </BentoTile>
      ))}

      {biweeks.map((q, i) => (
        <BentoTile key={q.biweek} index={4 + i} wide>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium">Quincena {q.biweek}</span>
            <span className="text-xs text-muted-foreground">{q.range}</span>
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {q.carryOver !== 0 && <Row label="Saldo anterior" value={q.carryOver} />}
            <Row label="Ingreso" value={q.income} />
            <Row label="Gasto fijo" value={q.fixed} />
            <Row label="Gasto variable" value={q.variable} />
            <Row label="Disponible" value={q.available} strong />
          </dl>
        </BentoTile>
      ))}
    </Bento>
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
          className={cn(strong && "font-medium", strong && value < 0 && "text-destructive")}
        />
      </dd>
    </>
  );
}
