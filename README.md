# Finanzas

Presupuesto personal por quincenas. Next.js 16 · TypeScript · Tailwind v4 · shadcn · Drizzle · PostgreSQL.

## Arranque local

```bash
cp .env.example .env          # DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finanzas
npm install
npx drizzle-kit push          # crea tablas
npx tsx src/db/seed.ts        # 17 categorías + ajustes por defecto
npm run dev
```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` | ESLint |
| `npm test` | Tests de cálculo (`node:test`) |
| `npm run db:push` | Sincroniza el esquema con la DB |
| `npm run db:seed` | Categorías y ajustes iniciales |
| `npm run db:studio` | Drizzle Studio |

## Estructura

```
src/
  app/            rutas (Server Components) + api/resumen
  actions/        Server Actions (next-safe-action + zod)
  components/
    dashboard/    resumen y consejos
    forms/        react-hook-form + zod
    layout/       shell, navegación, selector de mes, captura rápida
    lists/        listados con edición/eliminación
    shared/       piezas reutilizables (Amount, CategoryLabel, RowMenu…)
    ui/           shadcn (no editar a mano)
  db/             schema, cliente, seed
  hooks/
  lib/            calc (pura + test), period, money, queries, labels
  schemas/        zod
docs/DATABASE.md  esquema documentado
```

## Deploy (Railway)

1. Servicio Postgres → copiar `DATABASE_URL` a las variables del servicio web.
2. Build: `npm run build`. Start: `npm start`.
3. Una vez: `npm run db:push && npm run db:seed` (o `railway run`).
