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

export const CURRENCY_OPTIONS = [
  { value: "MXN", label: "Peso mexicano (MXN)" },
  { value: "USD", label: "Dólar estadounidense (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "COP", label: "Peso colombiano (COP)" },
  { value: "CRC", label: "Colón costarricense (CRC)" },
  { value: "ARS", label: "Peso argentino (ARS)" },
  { value: "CLP", label: "Peso chileno (CLP)" },
  { value: "PEN", label: "Sol peruano (PEN)" },
  { value: "GTQ", label: "Quetzal (GTQ)" },
];

export const TIME_ZONE_OPTIONS = [
  { value: "America/Mexico_City", label: "Ciudad de México" },
  { value: "America/Tijuana", label: "Tijuana" },
  { value: "America/Hermosillo", label: "Hermosillo" },
  { value: "America/Mazatlan", label: "Mazatlán" },
  { value: "America/Cancun", label: "Cancún" },
  { value: "America/Guatemala", label: "Guatemala" },
  { value: "America/Bogota", label: "Bogotá" },
  { value: "America/Lima", label: "Lima" },
  { value: "America/Santiago", label: "Santiago" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
  { value: "America/New_York", label: "Nueva York" },
  { value: "America/Los_Angeles", label: "Los Ángeles" },
  { value: "Europe/Madrid", label: "Madrid" },
];
