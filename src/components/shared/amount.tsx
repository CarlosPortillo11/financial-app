"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffectEvent, useLayoutEffect, useRef } from "react";
import { useMoney } from "@/components/layout/preferences";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  className?: string;
  /** Antepone "+" a los positivos. */
  signed?: boolean;
  tone?: "good" | "bad";
  animate?: boolean;
};

export function Amount({ value, className, signed, tone, animate: count }: Props) {
  const money = useMoney();
  const reduced = useReducedMotion();
  const format = (n: number) => (signed && n > 0 ? "+" : "") + money(n);
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  const write = useEffectEvent((node: ChildNode, n: number) => {
    node.nodeValue = format(n);
  });

  useLayoutEffect(() => {
    const node = ref.current?.firstChild;
    if (!count || reduced || !node) return;
    const controls = animate(from.current, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (n) => {
        from.current = n;
        write(node, Math.round(n));
      },
      onComplete: () => write(node, value),
    });
    return () => controls.stop();
  }, [value, count, reduced]);

  return (
    <span
      ref={ref}
      className={cn(
        "tnum",
        tone === "bad" && "text-destructive",
        tone === "good" && "text-success",
        className,
      )}
    >
      {format(value)}
    </span>
  );
}
