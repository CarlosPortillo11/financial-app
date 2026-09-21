"use client";

import { CheckIcon, PlusIcon, UndoIcon } from "lucide-react";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { deleteCard, setCardPaid } from "@/actions/cards";
import { CardForm } from "@/components/forms/card-form";
import { Amount } from "@/components/shared/amount";
import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { RowMenu } from "@/components/shared/row-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import type { Card as CardRow } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import type { CardStatement } from "@/lib/cards";
import { formatDate } from "@/lib/period";
import { cn } from "@/lib/utils";

export function dueLabel(daysLeft: number) {
  if (daysLeft < 0) return `vencido hace ${-daysLeft} día${daysLeft === -1 ? "" : "s"}`;
  if (daysLeft === 0) return "vence hoy";
  return `vence en ${daysLeft} día${daysLeft === 1 ? "" : "s"}`;
}

export function CardList({ rows }: { rows: CardStatement[] }) {
  const [editing, setEditing] = useState<CardRow | "new" | null>(null);
  const remove = useAction(deleteCard, feedback("Tarjeta eliminada"));
  const paid = useAction(setCardPaid, feedback("Tarjeta actualizada"));

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader
        title="Tarjetas"
        description="Asocia gastos a una tarjeta y sabrás cuánto pagar y cuándo."
        action={
          <Button onClick={() => setEditing("new")}>
            <PlusIcon data-icon="inline-start" />
            Nueva
          </Button>
        }
      />

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Sin tarjetas</EmptyTitle>
            <EmptyDescription>
              Agrega una con su día de corte y de pago; después elige la tarjeta al registrar gastos.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((s) => (
            <Card key={s.card.id} size="sm" className={cn(s.alert && "ring-2 ring-warning/60")}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="truncate">{s.card.name}</span>
                  <span className="flex items-center gap-2">
                    {s.paid ? (
                      <Badge variant="secondary">Pagada</Badge>
                    ) : s.toPay > 0 ? (
                      <Badge
                        variant={s.daysLeft < 0 ? "destructive" : "secondary"}
                        className={cn(s.alert && s.daysLeft >= 0 && "bg-warning/15 text-warning")}
                      >
                        {dueLabel(s.daysLeft)}
                      </Badge>
                    ) : null}
                    <RowMenu
                      deleteLabel={s.card.name}
                      onEdit={() => setEditing(s.card)}
                      onDelete={() => remove.execute({ id: s.card.id })}
                    />
                  </span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Corte el día {s.card.cutDay} · pago el día {s.card.payDay}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <dt className="text-muted-foreground">Por pagar</dt>
                  <dd className="text-right">
                    <Amount value={s.toPay} className={cn("font-semibold", s.paid && "line-through opacity-60")} />
                    <span className="block text-xs text-muted-foreground">
                      corte {formatDate(s.closedAt)} · límite {formatDate(s.dueAt)}
                    </span>
                  </dd>
                  <dt className="text-muted-foreground">Periodo actual</dt>
                  <dd className="text-right">
                    <Amount value={s.openTotal} className="font-medium" />
                    <span className="block text-xs text-muted-foreground">
                      corta el {formatDate(s.nextCut)}
                    </span>
                  </dd>
                </dl>
                <Button
                  variant={s.paid ? "ghost" : "default"}
                  size="sm"
                  disabled={paid.isPending || (!s.paid && s.toPay === 0)}
                  onClick={() =>
                    paid.execute({ id: s.card.id, statement: s.paid ? null : s.statement })
                  }
                >
                  {s.paid ? <UndoIcon data-icon="inline-start" /> : <CheckIcon data-icon="inline-start" />}
                  {s.paid ? "Desmarcar pago" : "Marcar como pagada"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ResponsiveModal
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? "Nueva tarjeta" : "Editar tarjeta"}
      >
        <CardForm
          key={editing === "new" ? "new" : editing?.id}
          initial={editing === "new" || editing === null ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      </ResponsiveModal>
    </div>
  );
}
