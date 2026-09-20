import type { Category } from "@/db/schema";
import { cn } from "@/lib/utils";

type Props = { category: Pick<Category, "emoji" | "name">; className?: string };

/** Emoji + nombre, en cualquier lista, selector o tabla. */
export function CategoryLabel({ category, className }: Props) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <span aria-hidden className="text-base leading-none">
        {category.emoji}
      </span>
      <span className="truncate">{category.name}</span>
    </span>
  );
}
