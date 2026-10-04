"use client";

import { CopyIcon, PlusIcon, TriangleAlertIcon } from "lucide-react";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import {
  deleteFixedExpense,
  duplicateFixedToNextMonth,
  setFixedStatus,
} from "@/actions/fixed-expenses";
import { FixedExpenseForm } from "@/components/forms/fixed-expense-form";
import { Amount } from "@/components/shared/amount";
import { CategoryLabel } from "@/components/shared/category-label";
import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { RowMenu } from "@/components/shared/row-menu";
import { Button } from "@/components/ui/button";
import { Bento, BentoTile } from "@/components/shared/bento";
import { FolderPanel } from "@/components/shared/folder-panel";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Card as CardRow, Category, FixedExpense } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { useMoney } from "@/components/layout/preferences";
import { biweekForDueDay, formatPeriod, type PayDays } from "@/lib/period";
import { cn } from "@/lib/utils";

type Props = {
  rows: FixedExpense[];
  categories: Category[];
  cards: CardRow[];
  period: string;
  payDays: PayDays;
  highlightId?: number;
};

export function FixedExpenseList({ rows, categories, cards, period, payDays, highlightId }: Props) {
  const money = useMoney();
  const [editing, setEditing] = useState<FixedExpense | "new" | null>(null);
  const remove = useAction(deleteFixedExpense, feedback("Gasto fijo eliminado"));
  const status = useAction(setFixedStatus, { onError: feedback("").onError });
  const duplicate = useAction(duplicateFixedToNextMonth, feedback("Copiado al mes siguiente"));
  const byId = new Map(categories.map((c) => [c.id, c]));
  const cardById = new Map(cards.map((c) => [c.id, c]));
  const total = rows.reduce((a, r) => a + r.amount, 0);
  const pending = rows.filter((r) => r.status === "pendiente").reduce((a, r) => a + r.amount, 0);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader
        title="Gastos fijos"
        description={`${formatPeriod(period)} · ${rows.length} pagos · por pagar ${money(pending)}`}
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
            <EmptyTitle>Sin gastos fijos este mes</EmptyTitle>
            <EmptyDescription>
              Agrega renta, servicios o suscripciones. Los marcados como recurrentes se copian solos
              al mes siguiente.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        ([1, 2] as const).map((q) => {
          const items = rows.filter((r) => r.biweek === q);
          if (!items.length) return null;
          const subtotal = items.reduce((a, r) => a + r.amount, 0);
          return (
            <FolderPanel
              key={q}
              title={`Quincena ${q}`}
              actions={<Amount value={subtotal} className="pr-1 text-sm text-muted-foreground" />}
            >
              <Bento className="md:grid-cols-3">
                {items.map((r, i) => {
                  const cat = byId.get(r.categoryId);
                  const misassigned = biweekForDueDay(r.dueDay, payDays) !== r.biweek;
                  return (
                    <BentoTile
                      key={r.id}
                      index={i}
                      interactive
                      className={cn(
                        "scroll-mt-24",
                        r.status === "pagado" && "opacity-60",
                        highlightId === r.id && "ring-2 ring-warning/60",
                      )}
                    >
                      <div id={`fijo-${r.id}`} className="flex items-start justify-between gap-2">
                        <Switch
                          aria-label={r.status === "pagado" ? "Marcar pendiente" : "Marcar pagado"}
                          checked={r.status === "pagado"}
                          onCheckedChange={(v) =>
                            status.execute({
                              id: r.id,
                              status: v ? "pagado" : "pendiente",
                            })
                          }
                        />
                        <RowMenu
                          deleteLabel={r.description}
                          onEdit={() => setEditing(r)}
                          onDelete={() => remove.execute({ id: r.id })}
                          extra={[
                            {
                              label: "Copiar al mes siguiente",
                              icon: CopyIcon,
                              onSelect: () => duplicate.execute({ id: r.id }),
                            },
                          ]}
                        />
                      </div>
                      <span
                        className={cn(
                          "mt-2 truncate font-medium",
                          r.status === "pagado" && "line-through",
                        )}
                      >
                        {r.description}
                      </span>
                      <Amount value={r.amount} className="text-xl tracking-tight" />
                      <span className="mt-auto flex flex-wrap items-center gap-x-2 pt-2 text-xs text-muted-foreground">
                        {cat && (
                          <CategoryLabel category={cat} className="[&>span:first-child]:text-xs" />
                        )}
                        <span>· día {r.dueDay}</span>
                        {r.cardId && <span>· {cardById.get(r.cardId)?.name}</span>}
                        {misassigned && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1 text-warning">
                                <TriangleAlertIcon className="size-3.5" />
                                Reorganizar
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Vence el día {r.dueDay} pero está en la quincena {r.biweek}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </span>
                    </BentoTile>
                  );
                })}
              </Bento>
            </FolderPanel>
          );
        })
      )}

      {rows.length > 0 && (
        <p className="text-right text-sm text-muted-foreground">
          Total fijo: <Amount value={total} className="font-medium text-foreground" />
        </p>
      )}

      <ResponsiveModal
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? "Nuevo gasto fijo" : "Editar gasto fijo"}
      >
        <FixedExpenseForm
          key={editing === "new" ? "new" : editing?.id}
          categories={categories}
          cards={cards}
          period={period}
          initial={editing === "new" || editing === null ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      </ResponsiveModal>
    </div>
  );
}
