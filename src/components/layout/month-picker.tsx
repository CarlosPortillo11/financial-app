"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MONTHLY_ROUTES } from "@/lib/nav";
import { currentPeriod, formatPeriod, isPeriod, shiftPeriod } from "@/lib/period";

export function MonthPicker() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("m");
  const period = isPeriod(raw) ? raw : currentPeriod();

  if (!MONTHLY_ROUTES.includes(pathname)) return null;

  const go = (p: string) => router.push(`${pathname}?m=${p}`);
  const isCurrent = period === currentPeriod();

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon-sm" aria-label="Mes anterior" onClick={() => go(shiftPeriod(period, -1))}>
        <ChevronLeftIcon />
      </Button>
      <button
        type="button"
        onClick={() => !isCurrent && go(currentPeriod())}
        title={isCurrent ? undefined : "Ir al mes actual"}
        className="min-w-36 rounded-lg px-2 py-1 text-center text-sm font-medium tracking-tight hover:bg-accent/60"
      >
        {formatPeriod(period)}
      </button>
      <Button variant="ghost" size="icon-sm" aria-label="Mes siguiente" onClick={() => go(shiftPeriod(period, 1))}>
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
