"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { actionClient, UserError } from "@/lib/safe-action";
import { signInSchema, signUpSchema } from "@/schemas";

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Correo o contraseña incorrectos",
  USER_ALREADY_EXISTS: "Ya hay una cuenta con ese correo",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Ya hay una cuenta con ese correo",
  PASSWORD_TOO_SHORT: "La contraseña es demasiado corta",
  INVALID_EMAIL: "Correo inválido",
};

async function call(run: () => Promise<unknown>) {
  try {
    await run();
  } catch (e) {
    if (isAPIError(e)) throw new UserError(MESSAGES[e.body?.code ?? ""] ?? "No se pudo completar, intenta de nuevo");
    throw e;
  }
}

export const signIn = actionClient.inputSchema(signInSchema).action(async ({ parsedInput }) => {
  await call(async () => auth.api.signInEmail({ body: parsedInput, headers: await headers() }));
});

export const signUp = actionClient.inputSchema(signUpSchema).action(async ({ parsedInput }) => {
  await call(async () => auth.api.signUpEmail({ body: parsedInput, headers: await headers() }));
});
