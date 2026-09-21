"use client";

import { BellRingIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { setCardPaid } from "@/actions/cards";
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
import { formatDate } from "@/lib/period";
import { cn } from "@/lib/utils";

/** Aviso modal al cargar la app: tarjetas sin pagar a ≤ 5 días (o vencidas). Se cierra solo al marcarlas pagadas. */
export function CardDueAlert({ due }: { due: CardStatement[] }) {
  // ponytail: estado inicial = hay avisos; el layout persiste entre navegaciones, así que solo reaparece al recargar.
  const [dismissed, setDismissed] = useState(false);
  const paid = useAction(setCardPaid, feedback("Pago registrado"));
  const overdue = due.some((s) => s.daysLeft < 0);

  return (
    <AlertDialog open={!dismissed && due.length > 0} onOpenChange={(o) => !o && setDismissed(true)}>
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
          <AlertDialogTitle>
            {overdue ? "Pago de tarjeta vencido" : "Se acerca el pago de tu tarjeta"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Márcala como pagada cuando lo hagas; este aviso seguirá apareciendo mientras tanto.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ul className="flex flex-col divide-y divide-border/60 rounded-lg border border-border/60">
          {due.map((s) => (
            <li key={s.card.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">{s.card.name}</span>
                <span className={cn("text-xs", s.daysLeft < 0 ? "text-destructive" : "text-muted-foreground")}>
                  {dueLabel(s.daysLeft)} · {formatDate(s.dueAt)}
                </span>
              </div>
              <Amount value={s.toPay} className="font-semibold" />
              <Button
                size="sm"
                variant="outline"
                disabled={paid.isPending}
                onClick={() => paid.execute({ id: s.card.id, statement: s.statement })}
                aria-label={`Marcar ${s.card.name} como pagada`}
              >
                <CheckIcon data-icon="inline-start" />
                Pagada
              </Button>
            </li>
          ))}
        </ul>

        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel>Cerrar</AlertDialogCancel>
          <Button asChild onClick={() => setDismissed(true)}>
            <Link href="/tarjetas">Ir a tarjetas</Link>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
