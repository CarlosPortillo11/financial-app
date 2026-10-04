# Ingresos recurrentes

## Qué hace
Un ingreso marcado como **"Se repite cada mes"** se registra solo, el mismo día, la primera
vez que abres un mes nuevo. Funciona igual que los gastos fijos recurrentes y usa el mismo
registro de "mes ya preparado" (`seeded_periods`), así que se copia una sola vez por mes.

- No duplica: si ya existe un ingreso con la misma fuente y fecha, lo salta.
- Si el día no existe en el mes destino (31 en febrero), usa el último día.
- En la lista, los ingresos recurrentes llevan la etiqueta **Cada mes**, y los de fecha futura **Programado**.

## Ejemplo de uso
Registras "Salario quincena 1" el 14 de septiembre y "Salario quincena 2" el 28, ambos con
"Se repite cada mes" activado. Al abrir octubre ya aparecen el 14 y el 28 de octubre;
solo ajustas el monto si cambió.

## Archivos modificados
| Archivo | Por qué |
| --- | --- |
| `src/db/schema.ts` | Columna `incomes.recurring` (boolean, default false) |
| `src/schemas/index.ts` | `incomeSchema` acepta `recurring` |
| `src/lib/queries.ts` | `ensureFixedForPeriod` pasa a `ensurePeriodSeeded`, que también llama a `seedIncomes`; `getIncomes` prepara el mes antes de leer |
| `src/lib/period.ts` | `shiftDate()` y `monthsBetween()` para mover una fecha N meses |
| `src/components/forms/fields.tsx` | `SwitchField` reutilizable (Controller + Switch) |
| `src/components/forms/income-form.tsx` | Interruptor "Se repite cada mes", activo por defecto para salario |
| `src/components/lists/income-list.tsx` | Etiquetas "Cada mes" y "Programado" |

## Código
```ts
const months = monthsBetween(from, period);
const copies = source
  .map(({ source, type, amount, date }) => ({ source, type, amount, date: shiftDate(date, months), recurring: true }))
  .filter((i) => !taken.has(key(i)));
if (copies.length) await tx.insert(incomes).values(copies);
```

> Los meses que ya estaban preparados antes de este cambio no reciben ingresos copiados.
> Empieza a funcionar desde el siguiente mes nuevo.
