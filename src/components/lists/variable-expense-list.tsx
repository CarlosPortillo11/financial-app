"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { deleteVariableExpense } from "@/actions/variable-expenses";
import { VariableExpenseForm } from "@/components/forms/variable-expense-form";
import { Amount } from "@/components/shared/amount";
import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { RowMenu } from "@/components/shared/row-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import type { Category, VariableExpense } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { money } from "@/lib/money";
import { biweekOf, formatDate, formatPeriod, type PayDays } from "@/lib/period";

type Props = { rows: VariableExpense[]; categories: Category[]; period: string; payDays: PayDays };

export function VariableExpenseList({ rows, categories, period, payDays }: Props) {
  const [editing, setEditing] = useState<VariableExpense | "new" | null>(null);
  const remove = useAction(deleteVariableExpense, feedback("Gasto eliminado"));
  const byId = new Map(categories.map((c) => [c.id, c]));
  const total = rows.reduce((a, r) => a + r.amount, 0);

  // Agrupado por fecha (ya vienen ordenados desc).
  const groups = rows.reduce<{ date: string; items: VariableExpense[] }[]>((acc, r) => {
    const last = acc[acc.length - 1];
    if (last?.date === r.date) last.items.push(r);
    else acc.push({ date: r.date, items: [r] });
    return acc;
  }, []);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader
        title="Gastos variables"
        description={`${formatPeriod(period)} · ${rows.length} movimientos · ${money(total)}`}
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
            <EmptyTitle>Nada registrado este mes</EmptyTitle>
            <EmptyDescription>
              Usa el botón + para capturar un gasto en segundos: monto, categoría y listo.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card size="sm">
          <CardContent className="flex flex-col px-0">
            {groups.map((g) => (
              <div key={g.date} className="flex flex-col">
                <div className="flex items-center justify-between bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground">
                  <span>
                    {formatDate(g.date)} · Q{biweekOf(g.date, payDays)}
                  </span>
                  <Amount value={g.items.reduce((a, r) => a + r.amount, 0)} />
                </div>
                {g.items.map((r) => {
                  const cat = byId.get(r.categoryId);
                  return (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/70 text-lg">
                        {cat?.emoji ?? "•"}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">{r.description || cat?.name}</span>
                        {r.description && (
                          <span className="truncate text-xs text-muted-foreground">{cat?.name}</span>
                        )}
                      </div>
                      <Amount value={r.amount} className="font-medium" />
                      <RowMenu
                        deleteLabel={r.description || cat?.name}
                        onEdit={() => setEditing(r)}
                        onDelete={() => remove.execute({ id: r.id })}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <ResponsiveModal
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? "Registrar gasto" : "Editar gasto"}
      >
        <VariableExpenseForm
          key={editing === "new" ? "new" : editing?.id}
          categories={categories}
          initial={editing === "new" || editing === null ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      </ResponsiveModal>
    </div>
  );
}
