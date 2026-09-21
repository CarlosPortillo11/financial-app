"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { createVariableExpense, updateVariableExpense } from "@/actions/variable-expenses";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { Card, Category, VariableExpense } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { today } from "@/lib/period";
import { variableExpenseSchema, type VariableExpenseInput } from "@/schemas";
import { CardField, CategoryField, DateField, NumberField, TextField } from "./fields";

type Props = { categories: Category[]; cards: Card[]; initial?: VariableExpense; onDone: () => void };

export function VariableExpenseForm({ categories, cards, initial, onDone }: Props) {
  const form = useForm<VariableExpenseInput>({
    resolver: zodResolver(variableExpenseSchema),
    defaultValues: initial
      ? {
          categoryId: initial.categoryId,
          cardId: initial.cardId,
          description: initial.description,
          amount: initial.amount,
          date: initial.date,
        }
      : { description: "", date: today(), cardId: null },
  });
  const create = useAction(createVariableExpense, feedback("Gasto guardado", onDone));
  const update = useAction(updateVariableExpense, feedback("Gasto actualizado", onDone));
  const pending = create.isPending || update.isPending;
  const options = categories.filter((c) => c.appliesTo !== "fijo");

  return (
    <form
      onSubmit={form.handleSubmit((data) =>
        initial ? update.execute({ id: initial.id, ...data }) : create.execute(data),
      )}
    >
      <FieldGroup className="gap-4">
        <NumberField control={form.control} name="amount" label="Monto" prefix="$" autoFocus />
        <CategoryField
          control={form.control}
          name="categoryId"
          label="Categoría"
          categories={options}
        />
        <div className="grid grid-cols-2 gap-4">
          <DateField control={form.control} name="date" label="Fecha" />
          <CardField control={form.control} name="cardId" label="Pagado con" cards={cards} />
        </div>
        <TextField
          control={form.control}
          name="description"
          label="Descripción (opcional)"
          placeholder="Ej. Súper de la semana"
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Spinner data-icon="inline-start" />}
          {initial ? "Guardar cambios" : "Registrar gasto"}
        </Button>
      </FieldGroup>
    </form>
  );
}
