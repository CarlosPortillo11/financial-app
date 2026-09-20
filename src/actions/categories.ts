"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";
import { categorySchema, idSchema, withId } from "@/schemas";

const revalidate = () => revalidatePath("/", "layout");

export const createCategory = actionClient
  .inputSchema(categorySchema)
  .action(async ({ parsedInput }) => {
    await db.insert(categories).values(parsedInput);
    revalidate();
  });

export const updateCategory = actionClient
  .inputSchema(withId(categorySchema))
  .action(async ({ parsedInput: { id, ...data } }) => {
    await db.update(categories).set(data).where(eq(categories.id, id));
    revalidate();
  });

export const toggleCategory = actionClient
  .inputSchema(z.object({ id: idSchema, active: z.boolean() }))
  .action(async ({ parsedInput: { id, active } }) => {
    await db.update(categories).set({ active }).where(eq(categories.id, id));
    revalidate();
  });

// Falla por FK si tiene movimientos; el mensaje lo traduce safe-action.
export const deleteCategory = actionClient
  .inputSchema(z.object({ id: idSchema }))
  .action(async ({ parsedInput: { id } }) => {
    await db.delete(categories).where(eq(categories.id, id));
    revalidate();
  });
