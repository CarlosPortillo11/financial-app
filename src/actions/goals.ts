"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { savingsGoals } from "@/db/schema";
import { ownsRefs } from "@/lib/queries";
import { authActionClient } from "@/lib/safe-action";
import { goalSchema, idSchema, withId, type GoalInput } from "@/schemas";

const revalidate = () => revalidatePath("/", "layout");
const toRow = ({ deadline, ...rest }: GoalInput) => ({ ...rest, deadline: deadline || null });
const mine = (id: number, userId: string) => and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId));

export const createGoal = authActionClient
  .inputSchema(goalSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    await ownsRefs(userId, parsedInput);
    await db.insert(savingsGoals).values({ ...toRow(parsedInput), userId });
    revalidate();
  });

export const updateGoal = authActionClient
  .inputSchema(withId(goalSchema))
  .action(async ({ parsedInput: { id, ...data }, ctx: { userId } }) => {
    await ownsRefs(userId, data);
    await db.update(savingsGoals).set(toRow(data)).where(mine(id, userId));
    revalidate();
  });

export const deleteGoal = authActionClient
  .inputSchema(z.object({ id: idSchema }))
  .action(async ({ parsedInput: { id }, ctx: { userId } }) => {
    await db.delete(savingsGoals).where(mine(id, userId));
    revalidate();
  });
