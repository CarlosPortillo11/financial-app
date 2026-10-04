# Saldo arrastrado

## Qué hace
Lo que sobró (o faltó) en los meses anteriores se suma a lo disponible del mes actual.
Se calcula con tres sumas sobre todo el historial anterior al mes:

`saldo = ingresos anteriores − gastos variables anteriores − gastos fijos anteriores`

- Entra en la **quincena 1**, que es donde empieza el mes de nómina.
- Se puede apagar en **Ajustes → Arrastrar saldo**, útil si los primeros meses no se registraron completos.
- Lo apartado en categorías de ahorro cuenta como gastado, así que no infla el saldo.

## Ejemplo de uso
En septiembre te sobraron $1,200. En octubre el resumen dice "Disponible $3,700" y debajo
"Incluye +$1,200 que sobró en meses anteriores". La tesela de la quincena 1 muestra la fila
"Saldo anterior".

## Archivos modificados
| Archivo | Por qué |
| --- | --- |
| `src/db/schema.ts` | Columna `settings.carry_balance` (default true) |
| `src/schemas/index.ts` | `settingsSchema` acepta `carryBalance` |
| `src/lib/queries.ts` | `getCarryOver()` con `sum()` en SQL; `getMonthData` lo incluye |
| `src/lib/calc.ts` | `carryOver` en `MonthData` y `Totals`; se suma al disponible y a la quincena 1 |
| `src/components/dashboard/hero-available.tsx` | Línea "Incluye … en meses anteriores"; el % comprometido pasa a `gastado / ingreso` |
| `src/components/dashboard/kpi-cards.tsx` | Fila "Saldo anterior" en la quincena |
| `src/components/forms/settings-form.tsx` | Interruptor "Arrastrar saldo" |

## Código
```ts
const [[inc], [vari], [fix]] = await Promise.all([
  db.select({ n: total(incomes.amount) }).from(incomes).where(lt(incomes.date, start)),
  db.select({ n: total(variableExpenses.amount) }).from(variableExpenses).where(lt(variableExpenses.date, start)),
  db.select({ n: total(fixedExpenses.amount) }).from(fixedExpenses).where(lt(fixedExpenses.period, period)),
]);
return round2(inc.n - vari.n - fix.n);
```
