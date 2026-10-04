"use client";

import { CheckIcon, PlusIcon, UndoIcon } from "lucide-react";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { deleteCard, deleteCardPayment } from "@/actions/cards";
import { CardPaymentForm } from "@/components/forms/card-payment-form";
import { CardForm } from "@/components/forms/card-form";
import { Amount } from "@/components/shared/amount";
import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { RowMenu } from "@/components/shared/row-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bento, BentoTile } from "@/components/shared/bento";
import { FolderPanel } from "@/components/shared/folder-panel";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import type { Card as CardRow } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import type { CardStatement } from "@/lib/cards";
import { useMoney } from "@/components/layout/preferences";
import { formatDate } from "@/lib/period";
import { cn } from "@/lib/utils";

export function dueLabel(daysLeft: number) {
  if (daysLeft < 0) return `vencido hace ${-daysLeft} día${daysLeft === -1 ? "" : "s"}`;
  if (daysLeft === 0) return "vence hoy";
  return `vence en ${daysLeft} día${daysLeft === 1 ? "" : "s"}`;
}

export function CardList({ rows }: { rows: CardStatement[] }) {
  const money = useMoney();
  const [editing, setEditing] = useState<CardRow | "new" | null>(null);
  const remove = useAction(deleteCard, feedback("Tarjeta eliminada"));
  const undo = useAction(deleteCardPayment, feedback("Pago eliminado"));
  const [paying, setPaying] = useState<CardStatement | null>(null);

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
              Agrega una con su día de corte y de pago; después elige la tarjeta al registrar
              gastos.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Bento>
          {rows.map((s, i) => (
            <BentoTile
              key={s.card.id}
              index={i}
              wide
              className={cn("gap-3", s.alert && "ring-2 ring-warning/60")}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{s.card.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Corte el día {s.card.cutDay} · pago el día {s.card.payDay}
                  </span>
                </div>
                <span className="flex items-center gap-2">
                  {s.paid && s.lastPayment ? (
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
              </div>

              <dl className="grid grid-cols-2 gap-3">
                <div className="tile rounded-xl p-3">
                  <dt className="text-xs text-muted-foreground">Por pagar</dt>
                  <dd>
                    <Amount
                      value={s.toPay}
                      className="text-lg tracking-tight"
                    />
                    <span className="block text-xs text-muted-foreground">
                      corte {formatDate(s.closedAt)} · límite {formatDate(s.dueAt)}
                    </span>
                  </dd>
                </div>
                <div className="tile rounded-xl p-3">
                  <dt className="text-xs text-muted-foreground">Periodo actual</dt>
                  <dd>
                    <Amount value={s.openTotal} className="text-lg tracking-tight" />
                    <span className="block text-xs text-muted-foreground">
                      corta el {formatDate(s.nextCut)}
                    </span>
                  </dd>
                </div>
              </dl>

              {s.pastDue > 0 && (
                <p className="text-xs text-destructive">
                  Incluye <Amount value={s.pastDue} /> de un corte anterior sin pagar.
                </p>
              )}

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  variant={s.paid ? "ghost" : "default"}
                  disabled={s.paid}
                  onClick={() => setPaying(s)}
                >
                  <CheckIcon data-icon="inline-start" />
                  {s.paid ? "Al corriente" : "Registrar pago"}
                </Button>
                {s.lastPayment && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={undo.isPending}
                    onClick={() => undo.execute({ id: s.lastPayment!.id })}
                    aria-label={`Deshacer pago de ${money(s.lastPayment.amount)}`}
                  >
                    <UndoIcon data-icon="inline-start" />
                    Deshacer {money(s.lastPayment.amount)}
                  </Button>
                )}
              </div>
            </BentoTile>
          ))}
        </Bento>
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

      <ResponsiveModal
        open={paying !== null}
        onOpenChange={(o) => !o && setPaying(null)}
        title={paying ? `Pago de ${paying.card.name}` : "Registrar pago"}
      >
        {paying && (
          <CardPaymentForm key={paying.card.id} statement={paying} onDone={() => setPaying(null)} />
        )}
      </ResponsiveModal>
    </div>
  );
}
