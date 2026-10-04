"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { fixedExpenses } from "@/db/schema";
import { shiftPeriod } from "@/lib/period";
import { ownsRefs } from "@/lib/queries";
import { authActionClient } from "@/lib/safe-action";
import { fixedExpenseSchema, idSchema, withId } from "@/schemas";

const revalidate = () => revalidatePath("/", "layout");
const mine = (id: number, userId: string) =>
  and(eq(fixedExpenses.id, id), eq(fixedExpenses.userId, userId));

export const createFixedExpense = authActionClient
  .inputSchema(fixedExpenseSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    await ownsRefs(userId, parsedInput);
    await db.insert(fixedExpenses).values({ ...parsedInput, userId });
    revalidate();
  });

export const updateFixedExpense = authActionClient
  .inputSchema(withId(fixedExpenseSchema))
  .action(async ({ parsedInput: { id, ...data }, ctx: { userId } }) => {
    await ownsRefs(userId, data);
    await db.update(fixedExpenses).set(data).where(mine(id, userId));
    revalidate();
  });

export const setFixedStatus = authActionClient
  .inputSchema(z.object({ id: idSchema, status: z.enum(["pagado", "pendiente"]) }))
  .action(async ({ parsedInput: { id, status }, ctx: { userId } }) => {
    await db.update(fixedExpenses).set({ status }).where(mine(id, userId));
    revalidate();
  });

export const deleteFixedExpense = authActionClient
  .inputSchema(z.object({ id: idSchema }))
  .action(async ({ parsedInput: { id }, ctx: { userId } }) => {
    await db.delete(fixedExpenses).where(mine(id, userId));
    revalidate();
  });

export const duplicateFixedToNextMonth = authActionClient
  .inputSchema(z.object({ id: idSchema }))
  .action(async ({ parsedInput: { id }, ctx: { userId } }) => {
    const row = await db.query.fixedExpenses.findFirst({ where: mine(id, userId) });
    if (!row) throw new Error("No existe");
    const { categoryId, cardId, description, amount, biweek, dueDay, active } = row;
    await db.insert(fixedExpenses).values({
      userId,
      categoryId,
      cardId,
      description,
      amount,
      biweek,
      dueDay,
      active,
      period: shiftPeriod(row.period, 1),
      status: "pendiente",
    });
    revalidate();
    return { period: shiftPeriod(row.period, 1) };
  });
