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

export type PayDays = { payDay1: number; payDay2: number };

/** Quincena por nómina: Q1 va del primer día de pago al día anterior al segundo; Q2 el resto (cruza al mes siguiente). */
export function biweekForDueDay(day: number, p: PayDays): Biweek {
  return day >= p.payDay1 && day < p.payDay2 ? 1 : 2;
}

export function biweekOf(date: string, p: PayDays): Biweek {
  return biweekForDueDay(Number(date.slice(8, 10)), p);
}

export function biweekLabel(n: Biweek, p: PayDays): string {
  return n === 1 ? `del ${p.payDay1} al ${p.payDay2 - 1}` : `del ${p.payDay2} al ${p.payDay1 - 1}`;
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
