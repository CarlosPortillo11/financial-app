"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { variableExpenses } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";
import { idSchema, variableExpenseSchema, withId } from "@/schemas";

const revalidate = () => revalidatePath("/", "layout");

export const createVariableExpense = actionClient
  .inputSchema(variableExpenseSchema)
  .action(async ({ parsedInput }) => {
    await db.insert(variableExpenses).values(parsedInput);
    revalidate();
  });

export const updateVariableExpense = actionClient
  .inputSchema(withId(variableExpenseSchema))
  .action(async ({ parsedInput: { id, ...data } }) => {
    await db.update(variableExpenses).set(data).where(eq(variableExpenses.id, id));
    revalidate();
  });

export const deleteVariableExpense = actionClient
  .inputSchema(z.object({ id: idSchema }))
  .action(async ({ parsedInput: { id } }) => {
    await db.delete(variableExpenses).where(eq(variableExpenses.id, id));
    revalidate();
  });
