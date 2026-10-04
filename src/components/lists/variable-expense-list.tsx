"use client";

import { PlusIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { deleteVariableExpense } from "@/actions/variable-expenses";
import { VariableExpenseForm } from "@/components/forms/variable-expense-form";
import { Amount } from "@/components/shared/amount";
import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { RowMenu } from "@/components/shared/row-menu";
import { Button } from "@/components/ui/button";
import { Bento, BentoTile } from "@/components/shared/bento";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import type { Card as CardRow, Category, VariableExpense } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { useMoney } from "@/components/layout/preferences";
import { biweekOf, formatDate, formatPeriod, type PayDays } from "@/lib/period";

type Props = {
  rows: VariableExpense[];
  categories: Category[];
  cards: CardRow[];
  period: string;
  payDays: PayDays;
};

export function VariableExpenseList({ rows, categories, cards, period, payDays }: Props) {
  const money = useMoney();
  const [editing, setEditing] = useState<VariableExpense | "new" | null>(null);
  const remove = useAction(deleteVariableExpense, feedback("Gasto eliminado"));
  const byId = new Map(categories.map((c) => [c.id, c]));
  const cardById = new Map(cards.map((c) => [c.id, c]));
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
        <Bento className="md:grid-cols-3">
          {groups.map((g, gi) => (
            <Fragment key={g.date}>
              <div className="col-span-full flex items-baseline justify-between gap-2 pt-2 text-xs text-muted-foreground first:pt-0">
                <span>
                  {formatDate(g.date)} · Q{biweekOf(g.date, payDays)}
                </span>
                <Amount value={g.items.reduce((a, r) => a + r.amount, 0)} />
              </div>
              {g.items.map((r, i) => {
                const cat = byId.get(r.categoryId);
                const sub = [r.description && cat?.name, cardById.get(r.cardId ?? 0)?.name]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <BentoTile key={r.id} index={gi + i} interactive>
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card text-lg">
                        {cat?.emoji ?? "•"}
                      </span>
                      <RowMenu
                        deleteLabel={r.description || cat?.name}
                        onEdit={() => setEditing(r)}
                        onDelete={() => remove.execute({ id: r.id })}
                      />
                    </div>
                    <span className="mt-2 truncate font-medium">{r.description || cat?.name}</span>
                    <Amount value={r.amount} className="text-xl tracking-tight" />
                    {sub && (
                      <span className="mt-auto truncate pt-2 text-xs text-muted-foreground">
                        {sub}
                      </span>
                    )}
                  </BentoTile>
                );
              })}
            </Fragment>
          ))}
        </Bento>
      )}

      <ResponsiveModal
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? "Registrar gasto" : "Editar gasto"}
      >
        <VariableExpenseForm
          key={editing === "new" ? "new" : editing?.id}
          categories={categories}
          cards={cards}
          initial={editing === "new" || editing === null ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      </ResponsiveModal>
    </div>
  );
}
