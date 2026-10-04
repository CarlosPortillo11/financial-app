import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import postgres from "postgres";

const [email, password, name] = process.argv.slice(2);
if (!email || !password || password.length < 8 || !name) {
  console.error('Usage: npx tsx src/db/migrate-multi-user.ts <email> <password (8+ chars)> "<name>"');
  process.exit(1);
}

const OWNED = [
  "categories",
  "cards",
  "card_payments",
  "fixed_expenses",
  "variable_expenses",
  "incomes",
  "savings_goals",
  "seeded_periods",
  "settings",
];

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

async function main() {
  const userId = randomUUID();
  const hash = await hashPassword(password);

  await sql.begin(async (tx) => {
    await tx`
      create table if not exists "user" (
        "id" text primary key not null,
        "name" text not null,
        "email" text not null,
        "email_verified" boolean default false not null,
        "image" text,
        "created_at" timestamp default now() not null,
        "updated_at" timestamp default now() not null,
        constraint "user_email_unique" unique("email")
      )`;
    await tx`
      create table if not exists "account" (
        "id" text primary key not null,
        "account_id" text not null,
        "provider_id" text not null,
        "user_id" text not null references "user"("id") on delete cascade,
        "access_token" text,
        "refresh_token" text,
        "id_token" text,
        "access_token_expires_at" timestamp,
        "refresh_token_expires_at" timestamp,
        "scope" text,
        "password" text,
        "created_at" timestamp default now() not null,
        "updated_at" timestamp not null
      )`;
    await tx`insert into "user" (id, name, email) values (${userId}, ${name}, ${email.toLowerCase()})`;
    await tx`
      insert into account (id, account_id, provider_id, user_id, password, updated_at)
      values (${randomUUID()}, ${userId}, 'credential', ${userId}, ${hash}, now())`;

    for (const table of OWNED) {
      await tx`alter table ${tx(table)} add column user_id text`;
      await tx`update ${tx(table)} set user_id = ${userId}`;
      await tx`alter table ${tx(table)} alter column user_id set not null`;
    }

    await tx`alter table categories drop constraint if exists categories_name_unique`;
    await tx`alter table categories add constraint categories_user_name_unique unique (user_id, name)`;
    await tx`alter table cards drop constraint if exists cards_name_unique`;
    await tx`alter table cards add constraint cards_user_name_unique unique (user_id, name)`;

    await tx`alter table seeded_periods drop constraint if exists seeded_periods_pkey`;
    await tx`alter table seeded_periods add constraint seeded_periods_user_id_period_pk primary key (user_id, period)`;

    await tx`alter table settings drop constraint if exists settings_single_row`;
    await tx`alter table settings drop constraint if exists settings_pkey`;
    await tx`alter table settings drop column id`;
    await tx`alter table settings add primary key (user_id)`;
  });

  console.log(`Owner ${email} created (${userId}); existing data now belongs to this account.`);
  await sql.end();
}

main();
