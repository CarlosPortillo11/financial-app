import { cn } from "@/lib/utils";

/** Rejilla bento: 2 columnas en móvil, 4 en escritorio. Las teselas declaran
 *  su span con `wide` / `tall`. */
export function Bento({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-4", className)}>{children}</div>;
}

type TileProps = {
  /** Índice para escalonar la entrada. */
  index?: number;
  wide?: boolean;
  tall?: boolean;
  active?: boolean;
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function BentoTile({
  index = 0,
  wide,
  tall,
  active,
  interactive,
  className,
  children,
}: TileProps) {
  return (
    <div
      style={{ "--i": index } as React.CSSProperties}
      className={cn(
        "tile tile-enter flex flex-col gap-1 p-4 md:p-5",
        interactive && "tile-interactive",
        active && "tile-active",
        wide && "col-span-2",
        tall && "row-span-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
