"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { createGoal, updateGoal } from "@/actions/goals";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { Category, SavingsGoal } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { goalSchema, type GoalInput } from "@/schemas";
import { CategoryField, DateField, NumberField, TextField } from "./fields";

type Props = { categories: Category[]; initial?: SavingsGoal; onDone: () => void };

export function GoalForm({ categories, initial, onDone }: Props) {
  const form = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          categoryId: initial.categoryId,
          target: initial.target,
          deadline: initial.deadline ?? "",
        }
      : { name: "", deadline: "" },
  });
  const create = useAction(createGoal, feedback("Meta creada", onDone));
  const update = useAction(updateGoal, feedback("Meta actualizada", onDone));
  const pending = create.isPending || update.isPending;

  return (
    <form
      onSubmit={form.handleSubmit((data) =>
        initial ? update.execute({ id: initial.id, ...data }) : create.execute(data),
      )}
    >
      <FieldGroup className="gap-4">
        <TextField
          control={form.control}
          name="name"
          label="Nombre"
          placeholder="Ej. Fondo de emergencia"
          autoFocus
        />
        <NumberField control={form.control} name="target" label="Cuánto quieres juntar" prefix="$" />
        <CategoryField
          control={form.control}
          name="categoryId"
          label="Categoría donde registras lo que apartas"
          categories={categories}
        />
        <DateField control={form.control} name="deadline" label="Fecha objetivo (opcional)" />
        <FieldDescription>
          El avance se calcula con todo lo que registras en esa categoría. Con fecha objetivo, te
          decimos cuánto apartar al mes.
        </FieldDescription>
        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Spinner data-icon="inline-start" />}
          {initial ? "Guardar cambios" : "Crear meta"}
        </Button>
      </FieldGroup>
    </form>
  );
}
