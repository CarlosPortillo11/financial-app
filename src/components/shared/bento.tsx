"use client";

import { motion } from "motion/react";
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

const spring = { type: "spring", stiffness: 420, damping: 30, mass: 0.8 } as const;

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
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ ...spring, delay: (index % 8) * 0.045 }}
      whileHover={interactive ? { y: -3, transition: spring } : undefined}
      whileTap={interactive ? { scale: 0.975, transition: spring } : undefined}
      className={cn(
        "tile flex flex-col gap-1 p-4 md:p-5",
        interactive && "tile-interactive",
        active && "tile-active",
        wide && "col-span-2",
        tall && "row-span-2",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
