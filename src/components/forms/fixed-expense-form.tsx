"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { Controller, useForm } from "react-hook-form";
import { createFixedExpense, updateFixedExpense } from "@/actions/fixed-expenses";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import type { Card, Category, FixedExpense } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { BIWEEK_OPTIONS, STATUS_OPTIONS } from "@/lib/labels";
import { fixedExpenseSchema, type FixedExpenseInput } from "@/schemas";
import { CardField, CategoryField, NumberField, SelectField, TextField } from "./fields";

type Props = {
  categories: Category[];
  cards: Card[];
  period: string;
  initial?: FixedExpense;
  onDone: () => void;
};

export function FixedExpenseForm({ categories, cards, period, initial, onDone }: Props) {
  const form = useForm<FixedExpenseInput>({
    resolver: zodResolver(fixedExpenseSchema),
    defaultValues: initial
      ? {
          categoryId: initial.categoryId,
          cardId: initial.cardId,
          description: initial.description,
          amount: initial.amount,
          period: initial.period,
          biweek: initial.biweek as 1 | 2,
          dueDay: initial.dueDay,
          status: initial.status,
          active: initial.active,
        }
      : { description: "", period, biweek: 1, status: "pendiente", active: true, cardId: null },
  });
  const create = useAction(createFixedExpense, feedback("Gasto fijo guardado", onDone));
  const update = useAction(updateFixedExpense, feedback("Gasto fijo actualizado", onDone));
  const pending = create.isPending || update.isPending;
  const options = categories.filter((c) => c.appliesTo !== "variable");

  return (
    <form
      onSubmit={form.handleSubmit((data) =>
        initial ? update.execute({ id: initial.id, ...data }) : create.execute(data),
      )}
    >
      <FieldGroup className="gap-4">
        <TextField
          control={form.control}
          name="description"
          label="Descripción"
          placeholder="Ej. Renta"
          autoFocus
        />
        <NumberField control={form.control} name="amount" label="Monto" prefix="$" />
        <CategoryField
          control={form.control}
          name="categoryId"
          label="Categoría"
          categories={options}
        />
        <div className="grid grid-cols-2 gap-4">
          <NumberField
            control={form.control}
            name="dueDay"
            label="Día límite"
            step="1"
            min={1}
            max={31}
          />
          <SelectField
            control={form.control}
            name="biweek"
            label="Quincena"
            options={BIWEEK_OPTIONS}
            numeric
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SelectField control={form.control} name="status" label="Estado" options={STATUS_OPTIONS} />
          <CardField control={form.control} name="cardId" label="Se carga a" cards={cards} />
        </div>
        <Controller
          control={form.control}
          name="active"
          render={({ field }) => (
            <Field orientation="horizontal">
              <div className="flex flex-col gap-0.5">
                <FieldLabel htmlFor="active">Recurrente</FieldLabel>
                <FieldDescription>Se copia al abrir un mes nuevo.</FieldDescription>
              </div>
              <Switch id="active" checked={field.value} onCheckedChange={field.onChange} />
            </Field>
          )}
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Spinner data-icon="inline-start" />}
          {initial ? "Guardar cambios" : "Agregar gasto fijo"}
        </Button>
      </FieldGroup>
    </form>
  );
}
