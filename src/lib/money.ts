const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** $#,##0.00 — mismo formato que el Excel. */
export function money(n: number): string {
  return fmt.format(n);
}

export function pct(ratio: number, digits = 1): string {
  return `${(ratio * 100).toFixed(digits)}%`;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
