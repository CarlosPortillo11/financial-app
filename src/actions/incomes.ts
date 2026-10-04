"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { incomes } from "@/db/schema";
import { authActionClient } from "@/lib/safe-action";
import { idSchema, incomeSchema, withId } from "@/schemas";

const revalidate = () => revalidatePath("/", "layout");

export const createIncome = authActionClient
  .inputSchema(incomeSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    await db.insert(incomes).values({ ...parsedInput, userId });
    revalidate();
  });

export const updateIncome = authActionClient
  .inputSchema(withId(incomeSchema))
  .action(async ({ parsedInput: { id, ...data }, ctx: { userId } }) => {
    await db.update(incomes).set(data).where(and(eq(incomes.id, id), eq(incomes.userId, userId)));
    revalidate();
  });

export const deleteIncome = authActionClient
  .inputSchema(z.object({ id: idSchema }))
  .action(async ({ parsedInput: { id }, ctx: { userId } }) => {
    await db.delete(incomes).where(and(eq(incomes.id, id), eq(incomes.userId, userId)));
    revalidate();
  });
