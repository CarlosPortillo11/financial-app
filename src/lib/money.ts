const formatters = new Map<string, Intl.NumberFormat>();

export function money(n: number, currency: string): string {
  let fmt = formatters.get(currency);
  if (!fmt) {
    fmt = new Intl.NumberFormat("es-MX", { style: "currency", currency });
    formatters.set(currency, fmt);
  }
  return fmt.format(n);
}

export function pct(ratio: number, digits = 1): string {
  return `${(ratio * 100).toFixed(digits)}%`;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
