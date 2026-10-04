# Estructura de la base de datos

PostgreSQL 17 · Drizzle ORM · fuente de verdad: `src/db/schema.ts`.
Sincronizar con `npx drizzle-kit push`. Cada usuario nuevo recibe ajustes y categorías por defecto al registrarse (`src/db/new-user.ts`).

```
user       1 ──< (todas las tablas de datos, vía user_id, cascade)
user       1 ──1 settings
user       1 ──< session, account   (Better Auth)
categories 1 ──< fixed_expenses
categories 1 ──< variable_expenses
categories 1 ──1 savings_goals
cards      1 ──< card_payments
```

## Multiusuario

Tablas de Better Auth (`user`, `session`, `account`, `verification`) en `src/db/auth-schema.ts`, generadas con `npx auth generate`.
Todas las tablas de datos tienen `user_id text not null` → `user.id` (`on delete cascade`). Toda consulta y acción filtra por `user_id`; las acciones validan además que `category_id` y `card_id` sean del mismo usuario (`ownsRefs`).
Los nombres únicos son por usuario: `categories (user_id, name)`, `cards (user_id, name)`; `seeded_periods` tiene PK `(user_id, period)`.


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
| `name` | varchar(60) | not null, **unique por usuario** | |
| `type` | `category_type` | not null | Eje de la regla 50/30/20 |
| `applies_to` | `category_scope` | not null, default `ambos` | Filtra qué formulario la ofrece |
| `active` | boolean | not null, default true | Desactivar en vez de borrar |
| `created_at` | timestamptz | not null, default now() | |

Borrado físico solo si no tiene movimientos: ambas FK son `ON DELETE RESTRICT`.

## `cards`

| Columna | Tipo | Restricción | Notas |
| --- | --- | --- | --- |
| `id` | serial | PK | |
| `name` | varchar(60) | not null, unique por usuario | |
| `cut_day` | smallint | not null, `1..31` | Día de corte |
| `pay_day` | smallint | not null, `1..31` | Día límite de pago; si es ≤ `cut_day` cae en el mes siguiente |
| `balance_from` | date | nullable | Cargos y pagos anteriores a esta fecha se consideran liquidados. Null = cuenta todo |
| `created_at` | timestamptz | not null, default now() | |

Saldo: cargos hasta el corte − pagos (`card_payments`). Lo no pagado se arrastra al siguiente corte y se marca vencido. Cálculo en `lib/cards.ts`; el pago de la tarjeta no es un gasto (los cargos ya lo son).

## `card_payments`

| Columna | Tipo | Restricción | Notas |
| --- | --- | --- | --- |
| `id` | serial | PK | |
| `card_id` | integer | FK → cards, cascade, **index** | |
| `amount` | numeric(12,2) | not null, `> 0` | Puede ser parcial |
| `date` | date | not null | |
| `created_at` | timestamptz | not null, default now() | |

## `seeded_periods`

| Columna | Tipo | Restricción | Notas |
| --- | --- | --- | --- |
| `user_id` | text | PK (con `period`) | |
| `period` | varchar(7) | PK (con `user_id`) | Mes cuyos fijos recurrentes ya se copiaron; se reclama dentro de la transacción de copia |

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

Auto-copia (`ensurePeriodSeeded` en `src/lib/queries.ts`): la primera vez que se consulta un mes
≥ actual (lo registra en `seeded_periods`), copia las filas `active` del último `period` anterior con
datos, en `pendiente`, sin duplicar las que ya existan (misma categoría y descripción). Meses pasados nunca se rellenan.

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
| `recurring` | boolean | not null, default false | Se copia al abrir un mes nuevo, mismo día del mes |
| `amount` | numeric(12,2) | not null, `> 0` | |
| `date` | date | not null, **index** | Mes y quincena derivados |
| `created_at` | timestamptz | not null, default now() | |

## `settings`

Una fila por usuario. Porcentajes enteros.

| Columna | Tipo | Default | Restricción |
| --- | --- | --- | --- |
| `user_id` | text | | PK, FK → user |
| `needs_pct` | smallint | 50 | |
| `wants_pct` | smallint | 30 | |
| `savings_pct` | smallint | 20 | `needs + wants + savings = 100` |
| `saving_split_pct` | smallint | 10 | |
| `invest_split_pct` | smallint | 10 | `saving_split + invest_split = savings_pct` |
| `pay_day_1` | smallint | 14 | Día del primer pago; `1..31`, `< pay_day_2` |
| `pay_day_2` | smallint | 28 | Día del segundo pago. Q1 = [`pay_day_1`, `pay_day_2`), Q2 = resto (cruza al mes siguiente) |
| `carry_balance` | boolean | true | Suma a lo disponible el saldo de meses anteriores |
| `time_zone` | varchar(64) | `America/Mexico_City` | Define qué día es "hoy" para quincenas y avisos |
| `currency` | varchar(3) | `MXN` | Código ISO 4217 para formatear montos |

## `savings_goals`

| Columna | Tipo | Restricción | Notas |
| --- | --- | --- | --- |
| `id` | serial | PK | |
| `name` | varchar(60) | not null | |
| `category_id` | integer | FK → categories, restrict, **unique** | Categoría de ahorro cuyo gasto acumulado es el avance |
| `target` | numeric(12,2) | not null, `> 0` | |
| `deadline` | date | nullable | Con fecha, se sugiere cuánto apartar al mes |
| `created_at` | timestamptz | not null, default now() | |

## Decisiones y posibles cambios futuros

- **Aislamiento por `user_id` en la aplicación**, no con Row Level Security de Postgres. Si algún día se expone la base a otro cliente, añadir RLS.
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
- **Moneda por usuario** (`settings.currency`); el formato usa `Intl.NumberFormat("es-MX")` con esa moneda.
- **Candidatos a índice si crece el histórico**: `variable_expenses(category_id)`,
  `fixed_expenses(category_id)`; hoy las consultas filtran por mes y son pequeñas.
