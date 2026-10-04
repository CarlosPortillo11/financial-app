"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MONTHLY_ROUTES } from "@/lib/nav";
import {
  currentPeriod,
  formatPeriod,
  formatPeriodRange,
  isPeriod,
  type Schedule,
  shiftPeriod,
} from "@/lib/period";

export function MonthPicker({ payDays }: { payDays: Schedule }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("m");
  const current = currentPeriod(payDays);
  const period = isPeriod(raw) ? raw : current;

  if (!MONTHLY_ROUTES.includes(pathname)) return null;

  const go = (p: string) => router.push(`${pathname}?m=${p}`);
  const isCurrent = period === current;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Mes anterior"
        onClick={() => go(shiftPeriod(period, -1))}
      >
        <ChevronLeftIcon />
      </Button>
      <button
        type="button"
        onClick={() => !isCurrent && go(current)}
        title={isCurrent ? undefined : "Ir al mes actual"}
        className="min-w-36 rounded-lg px-2 py-1 text-center hover:bg-accent/60"
      >
        <span className="block text-sm font-medium tracking-tight">{formatPeriod(period)}</span>
        <span className="block text-[0.6875rem] leading-tight text-muted-foreground">
          {formatPeriodRange(period, payDays)}
        </span>
      </button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Mes siguiente"
        onClick={() => go(shiftPeriod(period, 1))}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
