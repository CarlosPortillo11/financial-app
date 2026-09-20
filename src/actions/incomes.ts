"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { incomes } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";
import { idSchema, incomeSchema, withId } from "@/schemas";

const revalidate = () => revalidatePath("/", "layout");

export const createIncome = actionClient
  .inputSchema(incomeSchema)
  .action(async ({ parsedInput }) => {
    await db.insert(incomes).values(parsedInput);
    revalidate();
  });

export const updateIncome = actionClient
  .inputSchema(withId(incomeSchema))
  .action(async ({ parsedInput: { id, ...data } }) => {
    await db.update(incomes).set(data).where(eq(incomes.id, id));
    revalidate();
  });

export const deleteIncome = actionClient
  .inputSchema(z.object({ id: idSchema }))
  .action(async ({ parsedInput: { id } }) => {
    await db.delete(incomes).where(eq(incomes.id, id));
    revalidate();
  });
