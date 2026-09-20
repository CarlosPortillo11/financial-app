export type Biweek = 1 | 2;

/** YYYY-MM del mes actual (hora local). */
export function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** YYYY-MM-DD de hoy (hora local). */
export function today(): string {
  const d = new Date();
  return `${currentPeriod()}-${String(d.getDate()).padStart(2, "0")}`;
}

export const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isPeriod(s: unknown): s is string {
  return typeof s === "string" && PERIOD_RE.test(s);
}

export function shiftPeriod(period: string, delta: number): string {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Rango [inicio, fin) del mes en YYYY-MM-DD para filtrar por fecha. */
export function periodRange(period: string): { start: string; end: string } {
  return { start: `${period}-01`, end: `${shiftPeriod(period, 1)}-01` };
}

export function periodOf(date: string): string {
  return date.slice(0, 7);
}

/** Regla fija: día <= 15 es Q1, si no Q2. */
export function biweekOf(date: string): Biweek {
  return Number(date.slice(8, 10)) <= 15 ? 1 : 2;
}

export function biweekForDueDay(dueDay: number): Biweek {
  return dueDay <= 15 ? 1 : 2;
}

export function formatPeriod(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" })
    .format(new Date(y, m - 1, 1))
    .replace(/^./, (c) => c.toUpperCase());
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(
    new Date(y, m - 1, d),
  );
}
