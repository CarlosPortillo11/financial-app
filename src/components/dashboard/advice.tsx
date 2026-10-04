import { CheckCircle2Icon, CircleAlertIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { Amount } from "@/components/shared/amount";
import { CategoryLabel } from "@/components/shared/category-label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FolderPanel } from "@/components/shared/folder-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Settings } from "@/db/schema";
import type { MonthSummary } from "@/lib/calc";
import { TYPE_COLOR } from "@/lib/labels";
import { pct } from "@/lib/money";
import { cn } from "@/lib/utils";

export function RuleTable({ byType }: { byType: MonthSummary["byType"] }) {
  return (
    <FolderPanel
      title="Regla 50/30/20"
      description="Meta frente a lo real. En ahorro, quedarse corto es la señal de alerta."
      bodyClassName="overflow-x-auto px-0 py-5 md:py-6"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6">Tipo</TableHead>
            <TableHead className="text-right">Meta</TableHead>
            <TableHead className="text-right">Real</TableHead>
            <TableHead className="text-right">Diferencia</TableHead>
            <TableHead className="pr-6">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {byType.map((t) => (
            <TableRow key={t.type}>
              <TableCell className="pl-6 font-medium">
                <span className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", TYPE_COLOR[t.type])} aria-hidden />
                  {t.label}
                </span>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                <span className="tnum">{t.targetPct}%</span>
                <span className="block text-xs">
                  <Amount value={t.target} />
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="tnum font-medium">{pct(t.actualPct, 0)}</span>
                <span className="block text-xs text-muted-foreground">
                  <Amount value={t.actual} />
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Amount value={t.diff} signed tone={t.bad ? "bad" : "good"} />
              </TableCell>
              <TableCell className="pr-6">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm",
                    t.bad ? "text-destructive" : "text-success",
                  )}
                >
                  {t.bad ? (
                    <CircleAlertIcon className="size-4" />
                  ) : (
                    <CheckCircle2Icon className="size-4" />
                  )}
                  {t.message}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </FolderPanel>
  );
}

export function Suggestions({
  suggestions,
  settings,
}: {
  suggestions: MonthSummary["suggestions"];
  settings: Settings;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FolderPanel
        title={`Reparto del ${settings.savingsPct}%`}
        description={
          <>
            Lo que aún falta apartar este mes para llegar a la meta.{" "}
            <Link href="/ajustes" className="underline underline-offset-2">
              Cambiar
            </Link>
          </>
        }
      >
        <dl className="grid grid-cols-2 gap-3">
          <div className="tile rounded-xl bg-save/10 p-3">
            <dt className="text-xs text-muted-foreground">Ahorro · {settings.savingSplitPct}%</dt>
            <dd className="mt-1">
              <Amount value={suggestions.saving} className="text-lg font-medium" />
            </dd>
          </div>
          <div className="tile rounded-xl bg-save/10 p-3">
            <dt className="text-xs text-muted-foreground">
              Inversión · {settings.investSplitPct}%
            </dt>
            <dd className="mt-1">
              <Amount value={suggestions.invest} className="text-lg font-medium" />
            </dd>
          </div>
        </dl>
      </FolderPanel>
      <FolderPanel
        title="Gasto sin culpa"
        description={`Lo que aún cabe en el ${settings.wantsPct}% de deseos sin gastar dinero que no tienes.`}
      >
        <div className="tile rounded-xl bg-want/15 p-3">
          <Amount value={suggestions.guiltFree} className="text-2xl font-medium" />
          <p className="mt-1 text-xs text-muted-foreground">
            {suggestions.guiltFree > 0
              ? "Puedes gastarlo en algo que disfrutes sin salirte de la meta."
              : "No queda margen: ya usaste los deseos del mes o no alcanza lo disponible."}
          </p>
        </div>
      </FolderPanel>
    </div>
  );
}

export function Alerts({ alerts, period }: { alerts: MonthSummary["alerts"]; period: string }) {
  const { highCategories, misassignedFixed } = alerts;
  if (!highCategories.length && !misassignedFixed.length) {
    return (
      <Alert>
        <CheckCircle2Icon />
        <AlertTitle>Sin alertas este mes</AlertTitle>
        <AlertDescription>Ningún deseo alto ni pagos fijos por reorganizar.</AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {highCategories.length > 0 && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>
            {highCategories.length === 1
              ? "1 categoría con gasto alto"
              : `${highCategories.length} categorías con gasto alto`}
          </AlertTitle>
          <AlertDescription>
            <ul className="flex flex-col gap-1">
              {highCategories.map((c) => (
                <li key={c.category.id} className="flex items-center justify-between gap-3">
                  <CategoryLabel category={c.category} />
                  <span className="tnum">{pct(c.pctOfIncome, 0)} del ingreso</span>
                </li>
              ))}
            </ul>
            <Link href={`/variables?m=${period}`} className="underline underline-offset-2">
              Ver gastos del mes
            </Link>
          </AlertDescription>
        </Alert>
      )}
      {misassignedFixed.length > 0 && (
        <Alert className="border-warning/40 text-warning [&>svg]:text-warning">
          <TriangleAlertIcon />
          <AlertTitle className="text-foreground">
            {misassignedFixed.length === 1
              ? "1 pago fijo para reorganizar"
              : `${misassignedFixed.length} pagos fijos para reorganizar`}
          </AlertTitle>
          <AlertDescription className="text-foreground/80">
            <ul className="flex flex-col gap-1">
              {misassignedFixed.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/fijos?m=${period}&h=${f.id}#fijo-${f.id}`}
                    className="underline underline-offset-2"
                  >
                    {f.description}
                  </Link>{" "}
                  vence el día {f.dueDay} pero está en la quincena {f.biweek}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
