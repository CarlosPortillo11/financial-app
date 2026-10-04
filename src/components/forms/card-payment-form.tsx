"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { payCard } from "@/actions/cards";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { feedback } from "@/lib/action-feedback";
import type { CardStatement } from "@/lib/cards";
import { useMoney } from "@/components/layout/preferences";
import { today } from "@/lib/period";
import { cardPaymentSchema, type CardPaymentInput } from "@/schemas";
import { DateField, NumberField } from "./fields";

export function CardPaymentForm({ statement, onDone }: { statement: CardStatement; onDone: () => void }) {
  const money = useMoney();
  const form = useForm<CardPaymentInput>({
    resolver: zodResolver(cardPaymentSchema),
    defaultValues: { cardId: statement.card.id, amount: statement.toPay || undefined, date: today() },
  });
  const pay = useAction(payCard, feedback("Pago registrado", onDone));

  return (
    <form onSubmit={form.handleSubmit((data) => pay.execute(data))}>
      <FieldGroup className="gap-4">
        <NumberField control={form.control} name="amount" label="Monto pagado" prefix="$" autoFocus />
        <DateField control={form.control} name="date" label="Fecha del pago" />
        <FieldDescription>
          Si pagas menos de {money(statement.toPay)}, el resto se queda como saldo pendiente y se
          suma al siguiente corte.
        </FieldDescription>
        <Button type="submit" disabled={pay.isPending} className="w-full">
          {pay.isPending && <Spinner data-icon="inline-start" />}
          Registrar pago
        </Button>
      </FieldGroup>
    </form>
  );
}
