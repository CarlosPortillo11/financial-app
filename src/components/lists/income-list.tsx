"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { deleteIncome } from "@/actions/incomes";
import { IncomeForm } from "@/components/forms/income-form";
import { Amount } from "@/components/shared/amount";
import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { RowMenu } from "@/components/shared/row-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bento, BentoTile } from "@/components/shared/bento";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import type { Income } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { useMoney } from "@/components/layout/preferences";
import { biweekOf, formatDate, formatPeriod, today, type PayDays } from "@/lib/period";

type Props = { rows: Income[]; period: string; payDays: PayDays };

export function IncomeList({ rows, period, payDays }: Props) {
  const money = useMoney();
  const [editing, setEditing] = useState<Income | "new" | null>(null);
  const remove = useAction(deleteIncome, feedback("Ingreso eliminado"));
  const total = rows.reduce((a, r) => a + r.amount, 0);
  const now = today();

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader
        title="Ingresos"
        description={`${formatPeriod(period)} · ${money(total)}`}
        action={
          <Button onClick={() => setEditing("new")}>
            <PlusIcon data-icon="inline-start" />
            Agregar
          </Button>
        }
      />

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Sin ingresos este mes</EmptyTitle>
            <EmptyDescription>
              Registra tu salario por quincena para que el resumen calcule lo disponible.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Bento className="md:grid-cols-3">
          {rows.map((r, i) => (
            <BentoTile key={r.id} index={i} interactive>
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0 truncate font-medium">{r.source}</span>
                <RowMenu
                  deleteLabel={r.source}
                  onEdit={() => setEditing(r)}
                  onDelete={() => remove.execute({ id: r.id })}
                />
              </div>
              <Amount value={r.amount} className="text-xl tracking-tight text-success" />
              <span className="mt-auto flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                {formatDate(r.date)} · Q{biweekOf(r.date, payDays)}
                {r.type === "ingreso_extra" && <Badge variant="secondary">Extra</Badge>}
                {r.recurring && <Badge variant="outline">Cada mes</Badge>}
                {r.date > now && <Badge variant="secondary">Programado</Badge>}
              </span>
            </BentoTile>
          ))}
        </Bento>
      )}

      <ResponsiveModal
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? "Registrar ingreso" : "Editar ingreso"}
      >
        <IncomeForm
          key={editing === "new" ? "new" : editing?.id}
          initial={editing === "new" || editing === null ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      </ResponsiveModal>
    </div>
  );
}
