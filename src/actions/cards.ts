"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { cardPayments, cards } from "@/db/schema";
import { ownsRefs } from "@/lib/queries";
import { authActionClient } from "@/lib/safe-action";
import { cardPaymentSchema, cardSchema, idSchema, withId } from "@/schemas";

const revalidate = () => revalidatePath("/", "layout");

export const createCard = authActionClient
  .inputSchema(cardSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    await db.insert(cards).values({ ...parsedInput, userId });
    revalidate();
  });

export const updateCard = authActionClient
  .inputSchema(withId(cardSchema))
  .action(async ({ parsedInput: { id, ...data }, ctx: { userId } }) => {
    await db.update(cards).set(data).where(and(eq(cards.id, id), eq(cards.userId, userId)));
    revalidate();
  });

export const payCard = authActionClient
  .inputSchema(cardPaymentSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    await ownsRefs(userId, { cardId: parsedInput.cardId });
    await db.insert(cardPayments).values({ ...parsedInput, userId });
    revalidate();
  });

export const deleteCardPayment = authActionClient
  .inputSchema(z.object({ id: idSchema }))
  .action(async ({ parsedInput: { id }, ctx: { userId } }) => {
    await db.delete(cardPayments).where(and(eq(cardPayments.id, id), eq(cardPayments.userId, userId)));
    revalidate();
  });

// Los movimientos quedan sin tarjeta (FK set null).
export const deleteCard = authActionClient
  .inputSchema(z.object({ id: idSchema }))
  .action(async ({ parsedInput: { id }, ctx: { userId } }) => {
    await db.delete(cards).where(and(eq(cards.id, id), eq(cards.userId, userId)));
    revalidate();
  });
