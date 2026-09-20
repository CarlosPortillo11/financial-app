"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";
import { settingsSchema } from "@/schemas";

export const updateSettings = actionClient
  .inputSchema(settingsSchema)
  .action(async ({ parsedInput }) => {
    await db.update(settings).set(parsedInput).where(eq(settings.id, 1));
    revalidatePath("/", "layout");
  });
