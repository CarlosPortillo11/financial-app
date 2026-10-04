import { db } from "./index";
import { categories, settings } from "./schema";

const DEFAULT_CATEGORIES: Omit<typeof categories.$inferInsert, "userId">[] = [
  { emoji: "🏠", name: "Vivienda", type: "necesidad", appliesTo: "fijo" },
  { emoji: "💡", name: "Servicios", type: "necesidad", appliesTo: "ambos" },
  { emoji: "🛒", name: "Alimentación", type: "necesidad", appliesTo: "ambos" },
  { emoji: "🚗", name: "Transporte", type: "necesidad", appliesTo: "ambos" },
  { emoji: "🩺", name: "Salud", type: "necesidad", appliesTo: "ambos" },
  { emoji: "📚", name: "Educación", type: "necesidad", appliesTo: "ambos" },
  { emoji: "📱", name: "Teléfono", type: "necesidad", appliesTo: "fijo" },
  { emoji: "🍔", name: "Comida fuera/Delivery", type: "deseo", appliesTo: "variable" },
  { emoji: "🎬", name: "Entretenimiento", type: "deseo", appliesTo: "ambos" },
  { emoji: "👕", name: "Ropa y compras", type: "deseo", appliesTo: "variable" },
  { emoji: "✈️", name: "Viajes", type: "deseo", appliesTo: "variable" },
  { emoji: "🎁", name: "Regalos", type: "deseo", appliesTo: "variable" },
  { emoji: "📺", name: "Streaming/Suscripciones ocio", type: "deseo", appliesTo: "fijo" },
  { emoji: "📦", name: "Otros", type: "deseo", appliesTo: "ambos" },
  { emoji: "🐖", name: "Ahorro", type: "ahorro_inversion", appliesTo: "ambos" },
  { emoji: "📈", name: "Inversión", type: "ahorro_inversion", appliesTo: "ambos" },
  { emoji: "🛟", name: "Fondo de emergencia", type: "ahorro_inversion", appliesTo: "ambos" },
];

export async function setupNewUser(userId: string) {
  await db.transaction(async (tx) => {
    await tx.insert(settings).values({ userId }).onConflictDoNothing();
    await tx
      .insert(categories)
      .values(DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })))
      .onConflictDoNothing();
  });
}
