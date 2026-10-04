# Avisos de gastos fijos por vencer

## Qué hace
El aviso que aparece al abrir la app ya no es solo de tarjetas: también lista los gastos
fijos **pendientes** que vencen en 5 días o menos, o que ya vencieron. Se marcan como
pagados desde el mismo aviso.

- Revisa el mes de nómina actual y el anterior, para no perder uno vencido al cambiar de mes.
- Excluye los fijos cargados a tarjeta: esos ya los cubre el aviso de la tarjeta.
- Ordena por urgencia: primero lo vencido.

## Ejemplo de uso
La renta vence el 22 y hoy es 18. Al abrir la app aparece "Se acercan tus pagos" con
"Renta · Gasto fijo · vence en 4 días · 22 sep" y el botón **Pagado**. Al pulsarlo, el fijo
pasa a pagado y desaparece del aviso.

## Archivos modificados
| Archivo | Por qué |
| --- | --- |
| `src/lib/queries.ts` | `getDueFixed()`: pendientes sin tarjeta, con su fecha real y los días restantes |
| `src/components/layout/due-alert.tsx` | Antes `card-due-alert.tsx`; une tarjetas y fijos en una sola lista |
| `src/app/layout.tsx` | Carga `getDueFixed()` en paralelo con los estados de tarjeta |

## Código
```ts
return rows
  .map((expense) => {
    const dueAt = dueDate(expense.period, expense.dueDay, p);
    return { expense, dueAt, daysLeft: daysBetween(now, dueAt) };
  })
  .filter((d) => d.daysLeft <= ALERT_DAYS)
  .sort((a, b) => a.daysLeft - b.daysLeft);
```
