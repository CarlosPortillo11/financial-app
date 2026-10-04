"use server";

import { and, eq, gte, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { categories, fixedExpenses, variableExpenses } from "@/db/schema";
import { currentPeriod, formatPeriod, periodRange, shiftPeriod } from "@/lib/period";
import { getSettings } from "@/lib/queries";
import { authActionClient } from "@/lib/safe-action";
import { categorySchema, idSchema, withId } from "@/schemas";

const revalidate = () => revalidatePath("/", "layout");
const mine = (id: number, userId: string) => and(eq(categories.id, id), eq(categories.userId, userId));

export const createCategory = authActionClient
  .inputSchema(categorySchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    await db.insert(categories).values({ ...parsedInput, userId });
    revalidate();
  });

export const updateCategory = authActionClient
  .inputSchema(withId(categorySchema))
  .action(async ({ parsedInput: { id, ...data }, ctx: { userId } }) => {
    const [old, p] = await Promise.all([
      db.query.categories.findFirst({ where: mine(id, userId) }),
      getSettings(userId),
    ]);
    if (!old) throw new Error("No existe");
    const period = currentPeriod(p);
    const start = periodRange(period, p).start;
    const [pastFixed, pastVariable] = await Promise.all([
      db.query.fixedExpenses.findFirst({
        where: and(eq(fixedExpenses.categoryId, id), lt(fixedExpenses.period, period)),
        columns: { id: true },
      }),
      db.query.variableExpenses.findFirst({
        where: and(eq(variableExpenses.categoryId, id), lt(variableExpenses.date, start)),
        columns: { id: true },
      }),
    ]);
    if (old.type === data.type || (!pastFixed && !pastVariable)) {
      await db.update(categories).set(data).where(mine(id, userId));
      revalidate();
      return;
    }

    const suffix = ` · hasta ${formatPeriod(shiftPeriod(period, -1))}`;
    await db.transaction(async (tx) => {
      await tx
        .update(categories)
        .set({ name: old.name.slice(0, 60 - suffix.length) + suffix, active: false })
        .where(mine(id, userId));
      const [created] = await tx
        .insert(categories)
        .values({ ...data, userId })
        .returning({ id: categories.id });
      await tx
        .update(fixedExpenses)
        .set({ categoryId: created.id })
        .where(and(eq(fixedExpenses.categoryId, id), gte(fixedExpenses.period, period)));
      await tx
        .update(variableExpenses)
        .set({ categoryId: created.id })
        .where(and(eq(variableExpenses.categoryId, id), gte(variableExpenses.date, start)));
    });
    revalidate();
  });

export const toggleCategory = authActionClient
  .inputSchema(z.object({ id: idSchema, active: z.boolean() }))
  .action(async ({ parsedInput: { id, active }, ctx: { userId } }) => {
    await db.update(categories).set({ active }).where(mine(id, userId));
    revalidate();
  });

// Falla por FK si tiene movimientos; el mensaje lo traduce safe-action.
export const deleteCategory = authActionClient
  .inputSchema(z.object({ id: idSchema }))
  .action(async ({ parsedInput: { id }, ctx: { userId } }) => {
    await db.delete(categories).where(mine(id, userId));
    revalidate();
  });
