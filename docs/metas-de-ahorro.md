# Metas de ahorro

## Qué hace
Nueva sección **Metas** (`/metas`). Cada meta tiene nombre, monto objetivo, fecha opcional
y una categoría de tipo *Ahorro e inversión*. El avance es la suma de todo lo registrado en
esa categoría: no hay que capturar aportaciones aparte, basta con registrar el ahorro como
siempre.

- Cuentan los gastos variables hasta hoy y los fijos marcados como pagados.
- Con fecha objetivo, sugiere cuánto apartar al mes: `(objetivo − ahorrado) / meses restantes`.
- Una categoría solo puede tener una meta (restricción `unique`), para que el avance no se reparta.

## Ejemplo de uso
Creas la categoría "🛟 Fondo de emergencia" (Ahorro e inversión) y la meta "Fondo de
emergencia" por $30,000 para marzo de 2027. Cada vez que apartas $2,000 lo registras como
gasto en esa categoría. La tarjeta muestra $6,000 de $30,000, 20% y "Aparta $4,800 al mes".

## Archivos modificados
| Archivo | Por qué |
| --- | --- |
| `src/db/schema.ts` | Tabla `savings_goals` |
| `src/schemas/index.ts` | `goalSchema` (la fecha opcional llega como `""`) |
| `src/actions/goals.ts` | `createGoal`, `updateGoal` y `deleteGoal` con next-safe-action |
| `src/lib/safe-action.ts` | Mensaje claro si la categoría ya tiene meta |
| `src/lib/queries.ts` | `getGoals()`: suma por categoría con `groupBy` y cálculo mensual |
| `src/components/forms/goal-form.tsx` | Formulario con react-hook-form + zod |
| `src/components/lists/goal-list.tsx` | Teselas con `Progress` y estado vacío con `Empty` |
| `src/app/metas/page.tsx` | Página (Server Component) |
| `src/lib/nav.ts`, `src/components/layout/nav.tsx` | Entrada "Metas" en la navegación |

## Código
```ts
return goals.map((goal) => {
  const saved = round2(savedIn(goal.categoryId));
  const left = Math.max(0, goal.target - saved);
  const months = goal.deadline
    ? Math.max(1, monthsBetween(currentPeriod(p), periodOf(goal.deadline, p)) + 1)
    : 0;
  return {
    goal,
    category: cats.find((c) => c.id === goal.categoryId)!,
    saved,
    monthly: months ? round2(left / months) : null,
  };
});
```
