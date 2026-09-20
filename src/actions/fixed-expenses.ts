"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { fixedExpenses } from "@/db/schema";
import { shiftPeriod } from "@/lib/period";
import { actionClient } from "@/lib/safe-action";
import { fixedExpenseSchema, idSchema, withId } from "@/schemas";

const revalidate = () => revalidatePath("/", "layout");

export const createFixedExpense = actionClient
  .inputSchema(fixedExpenseSchema)
  .action(async ({ parsedInput }) => {
    await db.insert(fixedExpenses).values(parsedInput);
    revalidate();
  });

export const updateFixedExpense = actionClient
  .inputSchema(withId(fixedExpenseSchema))
  .action(async ({ parsedInput: { id, ...data } }) => {
    await db.update(fixedExpenses).set(data).where(eq(fixedExpenses.id, id));
    revalidate();
  });

export const setFixedStatus = actionClient
  .inputSchema(z.object({ id: idSchema, status: z.enum(["pagado", "pendiente"]) }))
  .action(async ({ parsedInput: { id, status } }) => {
    await db.update(fixedExpenses).set({ status }).where(eq(fixedExpenses.id, id));
    revalidate();
  });

export const deleteFixedExpense = actionClient
  .inputSchema(z.object({ id: idSchema }))
  .action(async ({ parsedInput: { id } }) => {
    await db.delete(fixedExpenses).where(eq(fixedExpenses.id, id));
    revalidate();
  });

export const duplicateFixedToNextMonth = actionClient
  .inputSchema(z.object({ id: idSchema }))
  .action(async ({ parsedInput: { id } }) => {
    const row = await db.query.fixedExpenses.findFirst({ where: eq(fixedExpenses.id, id) });
    if (!row) throw new Error("No existe");
    const { categoryId, description, amount, biweek, dueDay, active } = row;
    await db.insert(fixedExpenses).values({
      categoryId,
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
