"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { createCategory, updateCategory } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { Category } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { CATEGORY_TYPE_OPTIONS, SCOPE_OPTIONS } from "@/lib/labels";
import { categorySchema, type CategoryInput } from "@/schemas";
import { SelectField, TextField } from "./fields";

type Props = { initial?: Category; onDone: () => void };

export function CategoryForm({ initial, onDone }: Props) {
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: initial
      ? {
          emoji: initial.emoji,
          name: initial.name,
          type: initial.type,
          appliesTo: initial.appliesTo,
        }
      : { emoji: "", name: "", type: "necesidad", appliesTo: "ambos" },
  });
  const create = useAction(createCategory, feedback("Categoría creada", onDone));
  const update = useAction(updateCategory, feedback("Categoría actualizada", onDone));
  const pending = create.isPending || update.isPending;

  return (
    <form
      onSubmit={form.handleSubmit((data) =>
        initial ? update.execute({ id: initial.id, ...data }) : create.execute(data),
      )}
    >
      <FieldGroup className="gap-4">
        <div className="grid grid-cols-[5rem_1fr] gap-4">
          <TextField control={form.control} name="emoji" label="Emoji" placeholder="🏠" />
          <TextField
            control={form.control}
            name="name"
            label="Nombre"
            placeholder="Ej. Mascotas"
            autoFocus
          />
        </div>
        <SelectField
          control={form.control}
          name="type"
          label="Tipo (regla 50/30/20)"
          options={CATEGORY_TYPE_OPTIONS}
        />
        <SelectField
          control={form.control}
          name="appliesTo"
          label="Aparece en"
          options={SCOPE_OPTIONS}
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Spinner data-icon="inline-start" />}
          {initial ? "Guardar cambios" : "Crear categoría"}
        </Button>
      </FieldGroup>
    </form>
  );
}
