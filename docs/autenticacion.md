# Cuentas de usuario (Better Auth)

## Qué hace
Cada persona crea su cuenta con correo y contraseña y ve solo sus propios datos. El registro
es abierto. Al registrarse, la cuenta recibe ajustes por defecto y las categorías iniciales.
Zona horaria y moneda se eligen en **Ajustes → Región**.

- `/login` y `/registro` son las únicas páginas públicas; todo lo demás pide sesión.
- Cerrar sesión: menú del avatar (rail lateral en escritorio, encabezado en móvil).
- Pendiente para después: recuperar contraseña y verificar correo (requieren un servicio de envío de correos).

## Ejemplo de uso
Ana entra a `/registro`, pone nombre, correo y contraseña, y llega al resumen con sus
categorías listas. Elige "Bogotá" y "Peso colombiano (COP)" en Ajustes; desde ahí sus montos
se muestran en COP y su "hoy" es el de Bogotá. Nunca ve los datos de otra cuenta.

## Cómo se protege cada capa
| Capa | Archivo | Qué hace |
| --- | --- | --- |
| Proxy | `src/proxy.ts` | Comprobación rápida: sin cookie de sesión, redirige a `/login`. No es la protección real |
| Páginas | `src/app/(app)/layout.tsx`, `src/lib/session.ts` | `requireUser()` valida la sesión en el servidor y redirige si no hay |
| Consultas | `src/lib/queries.ts` | Todas reciben `userId` o los ajustes del usuario y filtran por `user_id` |
| Acciones | `src/lib/safe-action.ts` | `authActionClient` agrega `ctx.userId`; editar y borrar filtran por `id` **y** `user_id` |
| Referencias | `ownsRefs()` en `queries.ts` | Rechaza una `categoryId` o `cardId` de otro usuario enviada a mano |
| API | `src/app/api/resumen/route.ts` | Responde 401 sin sesión |

## Archivos modificados
| Archivo | Por qué |
| --- | --- |
| `src/lib/auth.ts`, `src/lib/auth-client.ts` | Configuración de Better Auth (Drizzle, correo y contraseña, `nextCookies`) y su cliente |
| `src/app/api/auth/[...all]/route.ts` | Rutas internas de Better Auth |
| `src/db/auth-schema.ts` | Tablas `user`, `session`, `account`, `verification` (generadas con `npx auth generate`) |
| `src/db/schema.ts` | `user_id` en todas las tablas; nombres únicos por usuario; `settings` con una fila por usuario, más `time_zone` y `currency` |
| `src/db/new-user.ts` | Antes `seed.ts`: crea los ajustes y las categorías de cada usuario nuevo (hook `user.create.after`) |
| `src/db/migrate-multi-user.ts` | Migración única: crea tu cuenta y le asigna los datos existentes |
| `src/actions/auth.ts` | `signIn` y `signUp` con next-safe-action; traduce los errores de Better Auth |
| `src/actions/*.ts` | Pasan a `authActionClient` y filtran por usuario |
| `src/app/(app)/…` | Las páginas se movieron al grupo `(app)`, cuyo layout exige sesión |
| `src/app/(auth)/…` | Layout y páginas de entrar y registrarse |
| `src/components/forms/auth-forms.tsx` | Formularios con react-hook-form + zod |
| `src/components/layout/user-menu.tsx` | Avatar con nombre, correo, Ajustes y "Cerrar sesión" |
| `src/components/layout/preferences.tsx` | Contexto con la moneda del usuario; `Amount` y `useMoney()` lo leen |
| `src/lib/period.ts` | `today(timeZone)` y `currentPeriod()` usan la zona horaria del usuario |
| `src/lib/money.ts` | `money(n, currency)` |

## Código
```ts
export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await getSession();
  if (!session) throw new AuthError();
  return next({ ctx: { userId: session.user.id } });
});

export const deleteIncome = authActionClient
  .inputSchema(z.object({ id: idSchema }))
  .action(async ({ parsedInput: { id }, ctx: { userId } }) => {
    await db.delete(incomes).where(and(eq(incomes.id, id), eq(incomes.userId, userId)));
    revalidate();
  });
```
