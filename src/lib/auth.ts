import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { setupNewUser } from "@/db/new-user";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  databaseHooks: {
    user: { create: { after: (user) => setupNewUser(user.id) } },
  },
  plugins: [nextCookies()],
});
