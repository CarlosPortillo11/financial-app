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
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import type { Income } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { money } from "@/lib/money";
import { biweekOf, formatDate, formatPeriod, type PayDays } from "@/lib/period";

type Props = { rows: Income[]; period: string; payDays: PayDays };

export function IncomeList({ rows, period, payDays }: Props) {
  const [editing, setEditing] = useState<Income | "new" | null>(null);
  const remove = useAction(deleteIncome, feedback("Ingreso eliminado"));
  const total = rows.reduce((a, r) => a + r.amount, 0);

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
        <Card size="sm">
          <CardContent className="flex flex-col divide-y divide-border/60 px-0">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{r.source}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {formatDate(r.date)} · Q{biweekOf(r.date, payDays)}
                    {r.type === "ingreso_extra" && <Badge variant="secondary">Extra</Badge>}
                  </span>
                </div>
                <Amount value={r.amount} className="font-medium text-success" />
                <RowMenu
                  deleteLabel={r.source}
                  onEdit={() => setEditing(r)}
                  onDelete={() => remove.execute({ id: r.id })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
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
