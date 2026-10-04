"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { variableExpenses } from "@/db/schema";
import { ownsRefs } from "@/lib/queries";
import { authActionClient } from "@/lib/safe-action";
import { idSchema, variableExpenseSchema, withId } from "@/schemas";

const revalidate = () => revalidatePath("/", "layout");
const mine = (id: number, userId: string) =>
  and(eq(variableExpenses.id, id), eq(variableExpenses.userId, userId));

export const createVariableExpense = authActionClient
  .inputSchema(variableExpenseSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    await ownsRefs(userId, parsedInput);
    await db.insert(variableExpenses).values({ ...parsedInput, userId });
    revalidate();
  });

export const updateVariableExpense = authActionClient
  .inputSchema(withId(variableExpenseSchema))
  .action(async ({ parsedInput: { id, ...data }, ctx: { userId } }) => {
    await ownsRefs(userId, data);
    await db.update(variableExpenses).set(data).where(mine(id, userId));
    revalidate();
  });

export const deleteVariableExpense = authActionClient
  .inputSchema(z.object({ id: idSchema }))
  .action(async ({ parsedInput: { id }, ctx: { userId } }) => {
    await db.delete(variableExpenses).where(mine(id, userId));
    revalidate();
  });
