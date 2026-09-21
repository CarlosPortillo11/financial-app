"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";
import { cardSchema, idSchema, periodSchema, withId } from "@/schemas";

const revalidate = () => revalidatePath("/", "layout");

export const createCard = actionClient
  .inputSchema(cardSchema)
  .action(async ({ parsedInput }) => {
    await db.insert(cards).values(parsedInput);
    revalidate();
  });

export const updateCard = actionClient
  .inputSchema(withId(cardSchema))
  .action(async ({ parsedInput: { id, ...data } }) => {
    await db.update(cards).set(data).where(eq(cards.id, id));
    revalidate();
  });

/** Marca (o desmarca con null) el corte indicado como pagado. */
export const setCardPaid = actionClient
  .inputSchema(z.object({ id: idSchema, statement: periodSchema.nullable() }))
  .action(async ({ parsedInput: { id, statement } }) => {
    await db.update(cards).set({ paidStatement: statement }).where(eq(cards.id, id));
    revalidate();
  });

// Los movimientos quedan sin tarjeta (FK set null).
export const deleteCard = actionClient
  .inputSchema(z.object({ id: idSchema }))
  .action(async ({ parsedInput: { id } }) => {
    await db.delete(cards).where(eq(cards.id, id));
    revalidate();
  });
