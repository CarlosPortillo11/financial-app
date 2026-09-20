import { currentPeriod, isPeriod } from "./period";

type SP = Promise<Record<string, string | string[] | undefined>>;

/** Lee ?m=YYYY-MM; si falta o es inválido usa el mes actual. */
export async function resolvePeriod(searchParams: SP): Promise<string> {
  const { m } = await searchParams;
  return isPeriod(m) ? m : currentPeriod();
}
