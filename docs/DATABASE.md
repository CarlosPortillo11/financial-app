# Estructura de la base de datos

PostgreSQL 17 · Drizzle ORM · fuente de verdad: `src/db/schema.ts`.
Sincronizar con `npx drizzle-kit push`. Seed inicial: `npx tsx src/db/seed.ts`.

```
categories 1 ──< fixed_expenses
categories 1 ──< variable_expenses
incomes            (sin FK)
settings           (fila única)
```

## Enums

| Enum | Valores |
| --- | --- |
| `category_type` | `necesidad` · `deseo` · `ahorro_inversion` |
| `category_scope` | `fijo` · `variable` · `ambos` |
| `fixed_status` | `pagado` · `pendiente` |
| `income_type` | `salario` · `ingreso_extra` |

## `categories`

| Columna | Tipo | Restricción | Notas |
| --- | --- | --- | --- |
| `id` | serial | PK | |
| `emoji` | varchar(16) | not null | Un emoji; 16 chars cubre ZWJ y tonos de piel |
| `name` | varchar(60) | not null, **unique** | |
| `type` | `category_type` | not null | Eje de la regla 50/30/20 |
| `applies_to` | `category_scope` | not null, default `ambos` | Filtra qué formulario la ofrece |
| `active` | boolean | not null, default true | Desactivar en vez de borrar |
| `created_at` | timestamptz | not null, default now() | |

Borrado físico solo si no tiene movimientos: ambas FK son `ON DELETE RESTRICT`.

## `cards`

| Columna | Tipo | Restricción | Notas |
| --- | --- | --- | --- |
| `id` | serial | PK | |
| `name` | varchar(60) | not null, unique | |
| `cut_day` | smallint | not null, `1..31` | Día de corte |
| `pay_day` | smallint | not null, `1..31` | Día límite de pago; si es ≤ `cut_day` cae en el mes siguiente |
| `paid_statement` | varchar(7) | nullable | `YYYY-MM` del último corte marcado como pagado; sin historial |
| `created_at` | timestamptz | not null, default now() | |

Estado de cuenta, monto por pagar y alertas se calculan en `lib/cards.ts` a partir de los movimientos con `card_id`; el pago de la tarjeta no es un gasto (los cargos ya lo son).

## `fixed_expenses`

| Columna | Tipo | Restricción | Notas |
| --- | --- | --- | --- |
| `id` | serial | PK | |
| `category_id` | integer | FK → categories, restrict | |
| `card_id` | integer | FK → cards, set null | Tarjeta con la que se paga (null = efectivo/débito) |
| `description` | varchar(120) | not null | |
| `amount` | numeric(12,2) | not null, `> 0` | |
| `period` | varchar(7) | not null, `^[0-9]{4}-(0[1-9]\|1[0-2])$`, **index** | `YYYY-MM`. Mes explícito: un fijo no tiene fecha de movimiento |
| `biweek` | smallint | not null, `in (1,2)` | Quincena elegida por el usuario |
| `due_day` | smallint | not null, `1..31` | Día límite de pago |
| `status` | `fixed_status` | not null, default `pendiente` | |
| `active` | boolean | not null, default true | Recurrente: se copia al abrir un mes nuevo |
| `created_at` | timestamptz | not null, default now() | |

Auto-copia (`ensureFixedForPeriod` en `src/lib/queries.ts`): al consultar un mes
≥ actual sin filas, copia las filas `active` del último `period` anterior con
datos, en `pendiente`. Meses pasados nunca se rellenan.

## `variable_expenses`

| Columna | Tipo | Restricción | Notas |
| --- | --- | --- | --- |
| `id` | serial | PK | |
| `category_id` | integer | FK → categories, restrict | |
| `card_id` | integer | FK → cards, set null | Tarjeta con la que se paga (null = efectivo/débito) |
| `description` | varchar(120) | not null, default `''` | Opcional en la captura rápida |
| `amount` | numeric(12,2) | not null, `> 0` | |
| `date` | date | not null, **index** | Mes y quincena se derivan (día en [`pay_day_1`, `pay_day_2`) → Q1, resto Q2) |
| `created_at` | timestamptz | not null, default now() | |

## `incomes`

| Columna | Tipo | Restricción | Notas |
| --- | --- | --- | --- |
| `id` | serial | PK | |
| `source` | varchar(120) | not null | Ej. "Salario quincena 1" |
| `type` | `income_type` | not null, default `salario` | |
| `amount` | numeric(12,2) | not null, `> 0` | |
| `date` | date | not null, **index** | Mes y quincena derivados |
| `created_at` | timestamptz | not null, default now() | |

## `settings`

Fila única (`id = 1`, CHECK). Porcentajes enteros.

| Columna | Tipo | Default | Restricción |
| --- | --- | --- | --- |
| `id` | smallint | 1 | PK, `= 1` |
| `needs_pct` | smallint | 50 | |
| `wants_pct` | smallint | 30 | |
| `savings_pct` | smallint | 20 | `needs + wants + savings = 100` |
| `saving_split_pct` | smallint | 10 | |
| `invest_split_pct` | smallint | 10 | `saving_split + invest_split = savings_pct` |
| `pay_day_1` | smallint | 14 | Día del primer pago; `1..31`, `< pay_day_2` |
| `pay_day_2` | smallint | 28 | Día del segundo pago. Q1 = [`pay_day_1`, `pay_day_2`), Q2 = resto (cruza al mes siguiente) |

## Decisiones y posibles cambios futuros

- **Sin tabla de usuario.** Un solo usuario. Para multiusuario: columna `user_id`
  en las cuatro tablas de datos + `settings` pasa a una fila por usuario.
- **`period` como texto `YYYY-MM`** en lugar de `date`. Evita problemas de zona
  horaria en JS y hace trivial comparar/ordenar. Si se quiere agregar por
  trimestre/año con SQL nativo, cambiar a `date` (primer día del mes).
- **Montos en `numeric(12,2)` leídos como `number`** (`mode: "number"` en
  Drizzle). Suficiente para finanzas personales; si se necesita precisión
  exacta en sumas grandes, pasar a `mode: "string"` + `decimal.js`.
- **Nada derivado se persiste**: totales, quincenas, %, 50/30/20 y alertas se
  calculan en `src/lib/calc.ts` (función pura, testeada en `calc.test.ts`).
- **Sin borrado lógico en movimientos**: se eliminan físicamente. Si se quiere
  papelera, añadir `deleted_at`.
- **Sin moneda** en el esquema: formato fijo `$#,##0.00` (MXN) en `src/lib/money.ts`.
- **Candidatos a índice si crece el histórico**: `variable_expenses(category_id)`,
  `fixed_expenses(category_id)`; hoy las consultas filtran por mes y son pequeñas.
