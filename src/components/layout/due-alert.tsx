"use client";

import { BellRingIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { payCard } from "@/actions/cards";
import { setFixedStatus } from "@/actions/fixed-expenses";
import { Amount } from "@/components/shared/amount";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { feedback } from "@/lib/action-feedback";
import { dueLabel } from "@/components/lists/card-list";
import type { CardStatement } from "@/lib/cards";
import { formatDate, today } from "@/lib/period";
import type { DueFixed } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Row = {
  key: string;
  kind: string;
  name: string;
  amount: number;
  daysLeft: number;
  dueAt: string;
  href: string;
  pay: () => void;
};

/** Aviso modal al cargar la app: tarjetas y gastos fijos sin pagar a ≤ 5 días (o vencidos). */
export function DueAlert({ cards, fixed }: { cards: CardStatement[]; fixed: DueFixed[] }) {
  // ponytail: estado inicial = hay avisos; el layout persiste entre navegaciones, así que solo reaparece al recargar.
  const [dismissed, setDismissed] = useState(false);
  const card = useAction(payCard, feedback("Pago registrado"));
  const status = useAction(setFixedStatus, feedback("Marcado como pagado"));
  const pending = card.isPending || status.isPending;

  const rows: Row[] = [
    ...cards.map((s) => ({
      key: `card-${s.card.id}`,
      kind: "Tarjeta",
      name: s.card.name,
      amount: s.toPay,
      daysLeft: s.daysLeft,
      dueAt: s.dueAt,
      href: "/tarjetas",
      pay: () => card.execute({ cardId: s.card.id, amount: s.toPay, date: today() }),
    })),
    ...fixed.map(({ expense, dueAt, daysLeft }) => ({
      key: `fixed-${expense.id}`,
      kind: "Gasto fijo",
      name: expense.description,
      amount: expense.amount,
      daysLeft,
      dueAt,
      href: `/fijos?m=${expense.period}&h=${expense.id}#fijo-${expense.id}`,
      pay: () => status.execute({ id: expense.id, status: "pagado" }),
    })),
  ].sort((a, b) => a.daysLeft - b.daysLeft);
  const overdue = rows.some((r) => r.daysLeft < 0);

  return (
    <AlertDialog open={!dismissed && rows.length > 0} onOpenChange={(o) => !o && setDismissed(true)}>
      <AlertDialogContent size="sm" className="max-w-sm">
        <AlertDialogHeader className="items-center text-center">
          <span className="relative mb-2 inline-flex size-16 items-center justify-center">
            <span
              className={cn(
                "absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping",
                overdue ? "bg-destructive/40" : "bg-warning/40",
              )}
              aria-hidden
            />
            <span
              className={cn(
                "relative inline-flex size-16 items-center justify-center rounded-full",
                overdue ? "bg-destructive/15 text-destructive" : "bg-warning/20 text-warning",
              )}
            >
              <BellRingIcon className="size-8 motion-safe:animate-ring" />
            </span>
          </span>
          <AlertDialogTitle>{overdue ? "Tienes pagos vencidos" : "Se acercan tus pagos"}</AlertDialogTitle>
          <AlertDialogDescription>
            Márcalos como pagados cuando lo hagas; este aviso seguirá apareciendo mientras tanto.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ul className="flex max-h-72 flex-col divide-y divide-border/60 overflow-y-auto rounded-lg border border-border/60">
          {rows.map((r) => (
            <li key={r.key} className="flex items-center gap-3 px-3 py-2.5">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">{r.name}</span>
                <span
                  className={cn("text-xs", r.daysLeft < 0 ? "text-destructive" : "text-muted-foreground")}
                >
                  {r.kind} · {dueLabel(r.daysLeft)} · {formatDate(r.dueAt)}
                </span>
              </div>
              <Amount value={r.amount} className="font-medium" />
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={r.pay}
                aria-label={`Marcar ${r.name} como pagado`}
              >
                <CheckIcon data-icon="inline-start" />
                Pagado
              </Button>
            </li>
          ))}
        </ul>

        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel>Cerrar</AlertDialogCancel>
          {rows[0] && (
            <Button asChild onClick={() => setDismissed(true)}>
              <Link href={rows[0].href}>Ver {rows[0].kind === "Tarjeta" ? "tarjetas" : "fijos"}</Link>
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
