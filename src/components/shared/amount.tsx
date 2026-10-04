"use client";

import { useMoney } from "@/components/layout/preferences";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  className?: string;
  /** Antepone "+" a los positivos. */
  signed?: boolean;
  tone?: "good" | "bad";
};

export function Amount({ value, className, signed, tone }: Props) {
  const money = useMoney();
  return (
    <span
      className={cn(
        "tnum",
        tone === "bad" && "text-destructive",
        tone === "good" && "text-success",
        className,
      )}
    >
      {signed && value > 0 ? "+" : ""}
      {money(value)}
    </span>
  );
}
