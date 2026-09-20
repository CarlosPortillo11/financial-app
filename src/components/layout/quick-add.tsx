"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { VariableExpenseForm } from "@/components/forms/variable-expense-form";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { Button } from "@/components/ui/button";
import type { Category } from "@/db/schema";

/** Captura rápida de gasto variable: botón flotante en móvil, botón normal en escritorio. */
export function QuickAdd({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="lg"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-40 size-14 rounded-full shadow-[0_8px_24px_-6px_var(--primary)] md:static md:size-auto md:rounded-lg md:shadow-none"
        aria-label="Registrar gasto"
      >
        <PlusIcon data-icon="inline-start" className="size-6 md:size-4" />
        <span className="hidden md:inline">Nuevo gasto</span>
      </Button>
      <ResponsiveModal
        open={open}
        onOpenChange={setOpen}
        title="Registrar gasto"
        description="Monto y categoría bastan; la quincena se calcula sola."
      >
        <VariableExpenseForm categories={categories} onDone={() => setOpen(false)} />
      </ResponsiveModal>
    </>
  );
}
