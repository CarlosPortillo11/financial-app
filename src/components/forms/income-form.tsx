"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { createIncome, updateIncome } from "@/actions/incomes";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { Income } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { INCOME_TYPE_OPTIONS } from "@/lib/labels";
import { today } from "@/lib/period";
import { incomeSchema, type IncomeInput } from "@/schemas";
import { DateField, NumberField, SelectField, SwitchField, TextField } from "./fields";

type Props = { initial?: Income; onDone: () => void };

export function IncomeForm({ initial, onDone }: Props) {
  const form = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema),
    defaultValues: initial
      ? {
          source: initial.source,
          type: initial.type,
          amount: initial.amount,
          date: initial.date,
          recurring: initial.recurring,
        }
      : { source: "Salario", type: "salario", date: today(), recurring: true },
  });
  const create = useAction(createIncome, feedback("Ingreso guardado", onDone));
  const update = useAction(updateIncome, feedback("Ingreso actualizado", onDone));
  const pending = create.isPending || update.isPending;

  return (
    <form
      onSubmit={form.handleSubmit((data) =>
        initial ? update.execute({ id: initial.id, ...data }) : create.execute(data),
      )}
    >
      <FieldGroup className="gap-4">
        <NumberField control={form.control} name="amount" label="Monto" prefix="$" autoFocus />
        <TextField
          control={form.control}
          name="source"
          label="Fuente"
          placeholder="Ej. Salario mensual"
        />
        <SelectField control={form.control} name="type" label="Tipo" options={INCOME_TYPE_OPTIONS} />
        <DateField control={form.control} name="date" label="Fecha" />
        <SwitchField
          control={form.control}
          name="recurring"
          label="Se repite cada mes"
          description="Se registra solo el mismo día de los meses siguientes."
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Spinner data-icon="inline-start" />}
          {initial ? "Guardar cambios" : "Registrar ingreso"}
        </Button>
      </FieldGroup>
    </form>
  );
}
