import { createSafeActionClient } from "next-safe-action";
import { getSession } from "./session";

class AuthError extends Error {}
export class UserError extends Error {}

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    // Error de FK al borrar categoría con movimientos, o de CHECK; mensaje legible.
    if (e instanceof AuthError) return "Tu sesión terminó; vuelve a iniciar sesión";
    if (e instanceof UserError) return e.message;
    if (e.message.includes("violates foreign key")) {
      return "Tiene movimientos asociados; desactívala en vez de eliminarla";
    }
    if (e.message.includes("savings_goals_category_id_unique")) return "Esa categoría ya tiene una meta";
    if (e.message.includes("duplicate key")) return "Ya existe un registro con ese nombre";
    console.error(e);
    return "Algo salió mal, intenta de nuevo";
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await getSession();
  if (!session) throw new AuthError();
  return next({ ctx: { userId: session.user.id } });
});
