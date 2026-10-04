"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { deleteCategory, toggleCategory } from "@/actions/categories";
import { CategoryForm } from "@/components/forms/category-form";
import { CategoryLabel } from "@/components/shared/category-label";
import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { RowMenu } from "@/components/shared/row-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bento, BentoTile } from "@/components/shared/bento";
import { FolderPanel } from "@/components/shared/folder-panel";
import { Switch } from "@/components/ui/switch";
import type { Category, CategoryType } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { TYPE_LABEL } from "@/lib/calc";
import { TYPE_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";

const SCOPE_BADGE = {
  fijo: "Fijos",
  variable: "Variables",
  ambos: null,
} as const;

export function CategoryList({ rows }: { rows: Category[] }) {
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const remove = useAction(deleteCategory, feedback("Categoría eliminada"));
  const toggle = useAction(toggleCategory, { onError: feedback("").onError });

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader
        title="Categorías"
        description="Desactiva las que no uses; solo se eliminan si no tienen movimientos."
        action={
          <Button onClick={() => setEditing("new")}>
            <PlusIcon data-icon="inline-start" />
            Nueva
          </Button>
        }
      />

      {(Object.keys(TYPE_LABEL) as CategoryType[]).map((type) => {
        const items = rows.filter((c) => c.type === type);
        return (
          <FolderPanel
            key={type}
            title={TYPE_LABEL[type]}
            actions={
              <span className={cn("mr-1 size-2.5 rounded-full", TYPE_COLOR[type])} aria-hidden />
            }
          >
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin categorías.</p>
            ) : (
              <Bento className="md:grid-cols-3">
                {items.map((c, i) => (
                  <BentoTile
                    key={c.id}
                    index={i}
                    interactive
                    className={cn(!c.active && "opacity-50")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <CategoryLabel category={c} className="min-w-0 font-medium" />
                      <RowMenu
                        deleteLabel={c.name}
                        onEdit={() => setEditing(c)}
                        onDelete={() => remove.execute({ id: c.id })}
                      />
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      {SCOPE_BADGE[c.appliesTo] ? (
                        <Badge variant="secondary">{SCOPE_BADGE[c.appliesTo]}</Badge>
                      ) : (
                        <span />
                      )}
                      <Switch
                        aria-label={c.active ? "Desactivar" : "Activar"}
                        checked={c.active}
                        onCheckedChange={(active) => toggle.execute({ id: c.id, active })}
                      />
                    </div>
                  </BentoTile>
                ))}
              </Bento>
            )}
          </FolderPanel>
        );
      })}

      <ResponsiveModal
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? "Nueva categoría" : "Editar categoría"}
      >
        <CategoryForm
          key={editing === "new" ? "new" : editing?.id}
          initial={editing === "new" || editing === null ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      </ResponsiveModal>
    </div>
  );
}
