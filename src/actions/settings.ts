"use server";

import { and, eq, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { fixedExpenses, settings } from "@/db/schema";
import { currentPeriod } from "@/lib/period";
import { getSettings } from "@/lib/queries";
import { authActionClient } from "@/lib/safe-action";
import { settingsSchema } from "@/schemas";

export const updateSettings = authActionClient
  .inputSchema(settingsSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    const before = await getSettings(userId);
    const { payDay1, payDay2 } = parsedInput;
    await db.transaction(async (tx) => {
      await tx.update(settings).set(parsedInput).where(eq(settings.userId, userId));
      if (before.payDay1 === payDay1 && before.payDay2 === payDay2) return;
      await tx
        .update(fixedExpenses)
        .set({
          biweek: sql`case when ${fixedExpenses.dueDay} >= ${payDay1} and ${fixedExpenses.dueDay} < ${payDay2} then 1 else 2 end`,
        })
        .where(and(eq(fixedExpenses.userId, userId), gte(fixedExpenses.period, currentPeriod(parsedInput))));
    });
    revalidatePath("/", "layout");
  });
