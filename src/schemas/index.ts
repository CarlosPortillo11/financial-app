import { z } from "zod";
import { CURRENCY_OPTIONS, TIME_ZONE_OPTIONS } from "@/lib/labels";
import { isRealDate, PERIOD_RE } from "@/lib/period";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const idSchema = z.number().int().positive();

export const periodSchema = z.string().regex(PERIOD_RE, "Mes inválido");

export const dateSchema = z
  .string()
  .regex(DATE_RE, "Fecha inválida")
  .refine(isRealDate, "Esa fecha no existe");

export const amountSchema = z
  .number({ error: "Escribe un monto" })
  .positive("El monto debe ser mayor a 0")
  .max(99_999_999, "Monto demasiado grande")
  .multipleOf(0.01, "Máximo dos decimales");

const description = z.string().trim().max(120, "Máximo 120 caracteres");

export const categoryTypeSchema = z.enum(["necesidad", "deseo", "ahorro_inversion"]);
export const categoryScopeSchema = z.enum(["fijo", "variable", "ambos"]);
export const biweekSchema = z.union([z.literal(1), z.literal(2)], { error: "Elige la quincena" });
const dayField = z.number({ error: "Día entre 1 y 31" }).int().min(1, "Entre 1 y 31").max(31, "Entre 1 y 31");

export const categorySchema = z.object({
  // Un emoji puede ser varios code points (ZWJ, tono de piel); se limita por longitud.
  emoji: z
    .string()
    .trim()
    .min(1, "Elige un emoji")
    .max(16, "Solo un emoji")
    .refine((s) => /\p{Extended_Pictographic}/u.test(s), "Debe ser un emoji"),
  name: z.string().trim().min(2, "Mínimo 2 caracteres").max(60, "Máximo 60 caracteres"),
  type: categoryTypeSchema,
  appliesTo: categoryScopeSchema,
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const fixedExpenseSchema = z.object({
  categoryId: z.number({ error: "Elige una categoría" }).int().positive(),
  cardId: idSchema.nullable(),
  description: description.min(1, "Describe el gasto"),
  amount: amountSchema,
  period: periodSchema,
  biweek: biweekSchema,
  dueDay: dayField,
  status: z.enum(["pagado", "pendiente"]),
  active: z.boolean(),
});
export type FixedExpenseInput = z.infer<typeof fixedExpenseSchema>;

export const variableExpenseSchema = z.object({
  categoryId: z.number({ error: "Elige una categoría" }).int().positive(),
  cardId: idSchema.nullable(),
  description,
  amount: amountSchema,
  date: dateSchema,
});
export type VariableExpenseInput = z.infer<typeof variableExpenseSchema>;

export const incomeSchema = z.object({
  source: description.min(1, "Indica la fuente"),
  type: z.enum(["salario", "ingreso_extra"]),
  amount: amountSchema,
  date: dateSchema,
  recurring: z.boolean(),
});
export type IncomeInput = z.infer<typeof incomeSchema>;

const pctField = z.number({ error: "Escribe un porcentaje" }).int("Sin decimales").min(0).max(100);

export const settingsSchema = z
  .object({
    needsPct: pctField,
    wantsPct: pctField,
    savingsPct: pctField,
    savingSplitPct: pctField,
    investSplitPct: pctField,
    payDay1: dayField,
    payDay2: dayField,
    carryBalance: z.boolean(),
    timeZone: z.enum(TIME_ZONE_OPTIONS.map((o) => o.value) as [string, ...string[]]),
    currency: z.enum(CURRENCY_OPTIONS.map((o) => o.value) as [string, ...string[]]),
  })
  .refine((s) => s.payDay1 < s.payDay2, {
    message: "El primer día de pago debe ser menor que el segundo",
    path: ["payDay2"],
  })
  .refine((s) => s.needsPct + s.wantsPct + s.savingsPct === 100, {
    message: "Necesidades + Deseos + Ahorro deben sumar 100%",
    path: ["savingsPct"],
  })
  .refine((s) => s.savingSplitPct + s.investSplitPct === s.savingsPct, {
    message: "Ahorro + Inversión deben sumar el % de ahorro",
    path: ["investSplitPct"],
  });
export type SettingsInput = z.infer<typeof settingsSchema>;

export const withId = <T extends z.ZodRawShape>(shape: z.ZodObject<T>) =>
  shape.extend({ id: idSchema });

export const cardSchema = z.object({
  name: z.string().trim().min(1, "Ponle nombre").max(60, "Máximo 60 caracteres"),
  cutDay: dayField,
  payDay: dayField,
});
export type CardInput = z.infer<typeof cardSchema>;

export const cardPaymentSchema = z.object({
  cardId: idSchema,
  amount: amountSchema,
  date: dateSchema,
});
export type CardPaymentInput = z.infer<typeof cardPaymentSchema>;

export const goalSchema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres").max(60, "Máximo 60 caracteres"),
  categoryId: z.number({ error: "Elige una categoría de ahorro" }).int().positive(),
  target: amountSchema,
  deadline: dateSchema.or(z.literal("")),
});
export type GoalInput = z.infer<typeof goalSchema>;

const email = z.email("Correo inválido").trim().toLowerCase();

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Escribe tu contraseña"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres").max(60, "Máximo 60 caracteres"),
  email,
  password: z.string().min(8, "Mínimo 8 caracteres").max(128, "Máximo 128 caracteres"),
});
export type SignUpInput = z.infer<typeof signUpSchema>;
