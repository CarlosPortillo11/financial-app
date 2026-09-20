"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { createVariableExpense, updateVariableExpense } from "@/actions/variable-expenses";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { Category, VariableExpense } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { today } from "@/lib/period";
import { variableExpenseSchema, type VariableExpenseInput } from "@/schemas";
import { CategoryField, DateField, NumberField, TextField } from "./fields";

type Props = { categories: Category[]; initial?: VariableExpense; onDone: () => void };

export function VariableExpenseForm({ categories, initial, onDone }: Props) {
  const form = useForm<VariableExpenseInput>({
    resolver: zodResolver(variableExpenseSchema),
    defaultValues: initial
      ? {
          categoryId: initial.categoryId,
          description: initial.description,
          amount: initial.amount,
          date: initial.date,
        }
      : { description: "", date: today() },
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
        <DateField control={form.control} name="date" label="Fecha" />
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
