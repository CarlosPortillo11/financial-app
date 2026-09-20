import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    // Error de FK al borrar categoría con movimientos, o de CHECK; mensaje legible.
    if (e.message.includes("violates foreign key")) {
      return "Tiene movimientos asociados; desactívala en vez de eliminarla";
    }
    if (e.message.includes("duplicate key")) return "Ya existe un registro con ese nombre";
    console.error(e);
    return "Algo salió mal, intenta de nuevo";
  },
});
