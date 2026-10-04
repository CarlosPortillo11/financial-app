# Gasto diario ("Hoy puedes gastar")

## Qué hace
En el resumen del mes en curso aparece cuánto puedes gastar por día sin quedarte sin dinero
antes de tu siguiente pago. Divide el disponible de la quincena actual entre los días que
faltan para el próximo día de pago.

- En **quincena 1** usa el disponible de la quincena 1 (incluye el saldo arrastrado).
- En **quincena 2** usa el disponible de todo el mes: lo que sobró de la quincena 1 sigue en tu bolsillo.
- Si el disponible es negativo, muestra $0.

## Ejemplo de uso
Pagos el 14 y el 28. Hoy es 20 de septiembre y a la quincena 1 le quedan $1,600.
Faltan 8 días para el 28, así que la tarjeta dice **Hoy puedes gastar $200**, "al día durante
8 días, hasta tu pago del 28 sep". Solo aparece al ver el mes en curso.

## Archivos modificados
| Archivo | Por qué |
| --- | --- |
| `src/lib/period.ts` | `nextPayDate()`: siguiente día de pago, recortado al largo del mes |
| `src/lib/calc.ts` | `dailyAllowance()`: función pura, se prueba sin base de datos |
| `src/app/page.tsx` | Calcula el monto solo cuando el mes mostrado es el actual |
| `src/components/dashboard/hero-available.tsx` | Nueva tesela `DailyTile` junto al disponible |
| `src/lib/calc.test.ts` | Casos para quincena 1, quincena 2 y saldo negativo |

## Código
```ts
export function dailyAllowance(s: MonthSummary, p: PayDays, today: string): DailyAllowance {
  const left = biweekOf(today, p) === 1 ? s.byBiweek[0].available : s.totals.available;
  const until = nextPayDate(today, p);
  const days = daysBetween(today, until);
  return { amount: round2(Math.max(0, left) / days), days, until };
}
```
