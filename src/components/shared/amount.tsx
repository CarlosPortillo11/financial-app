import { money } from "@/lib/money";
import { cn } from "@/lib/utils";

type Props = { value: number; className?: string; signed?: boolean };

export function Amount({ value, className, signed }: Props) {
  return (
    <span
      className={cn(
        "tnum",
        signed && value < 0 && "text-destructive",
        signed && value > 0 && "text-success",
        className,
      )}
    >
      {signed && value > 0 ? "+" : ""}
      {money(value)}
    </span>
  );
}
