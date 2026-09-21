"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { createCard, updateCard } from "@/actions/cards";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { Card } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { cardSchema, type CardInput } from "@/schemas";
import { NumberField, TextField } from "./fields";

type Props = { initial?: Card; onDone: () => void };

export function CardForm({ initial, onDone }: Props) {
  const form = useForm<CardInput>({
    resolver: zodResolver(cardSchema),
    defaultValues: initial
      ? { name: initial.name, cutDay: initial.cutDay, payDay: initial.payDay }
      : { name: "" },
  });
  const create = useAction(createCard, feedback("Tarjeta creada", onDone));
  const update = useAction(updateCard, feedback("Tarjeta actualizada", onDone));
  const pending = create.isPending || update.isPending;

  return (
    <form
      onSubmit={form.handleSubmit((data) =>
        initial ? update.execute({ id: initial.id, ...data }) : create.execute(data),
      )}
    >
      <FieldGroup className="gap-4">
        <TextField control={form.control} name="name" label="Nombre" placeholder="Ej. BBVA Azul" autoFocus />
        <div className="grid grid-cols-2 gap-4">
          <NumberField control={form.control} name="cutDay" label="Día de corte" step="1" min={1} max={31} />
          <NumberField control={form.control} name="payDay" label="Día límite de pago" step="1" min={1} max={31} />
        </div>
        <FieldDescription>
          Si el día de pago es menor o igual al de corte, se entiende que cae en el mes siguiente.
        </FieldDescription>
        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Spinner data-icon="inline-start" />}
          {initial ? "Guardar cambios" : "Agregar tarjeta"}
        </Button>
      </FieldGroup>
    </form>
  );
}
