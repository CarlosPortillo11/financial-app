import type { Settings } from "@/db/schema";
import { currentPeriod, isPeriod } from "./period";

type SP = Promise<Record<string, string | string[] | undefined>>;

/** Lee ?m=YYYY-MM; si falta o es inválido usa el mes de nómina en curso. */
export async function resolvePeriod(searchParams: SP, s: Settings): Promise<string> {
  const { m } = await searchParams;
  return isPeriod(m) ? m : currentPeriod(s);
}
