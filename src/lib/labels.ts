import type { CategoryType } from "@/db/schema";

export const CATEGORY_TYPE_OPTIONS: { value: CategoryType; label: string }[] = [
  { value: "necesidad", label: "Necesidad" },
  { value: "deseo", label: "Deseo" },
  { value: "ahorro_inversion", label: "Ahorro / Inversión" },
];

export const SCOPE_OPTIONS = [
  { value: "fijo", label: "Solo gastos fijos" },
  { value: "variable", label: "Solo gastos variables" },
  { value: "ambos", label: "Ambos" },
];

export const BIWEEK_OPTIONS = [
  { value: "1", label: "Quincena 1" },
  { value: "2", label: "Quincena 2" },
];

export const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "pagado", label: "Pagado" },
];

export const INCOME_TYPE_OPTIONS = [
  { value: "salario", label: "Salario" },
  { value: "ingreso_extra", label: "Ingreso extra" },
];

export const TYPE_COLOR: Record<CategoryType, string> = {
  necesidad: "bg-need",
  deseo: "bg-want",
  ahorro_inversion: "bg-save",
};

export const TYPE_SHORT: Record<CategoryType, string> = {
  necesidad: "Necesidad",
  deseo: "Deseo",
  ahorro_inversion: "Ahorro",
};
