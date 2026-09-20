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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { Category, CategoryType } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { TYPE_LABEL } from "@/lib/calc";
import { TYPE_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";

const SCOPE_BADGE = { fijo: "Fijos", variable: "Variables", ambos: null } as const;

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
          <Card key={type} size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", TYPE_COLOR[type])} aria-hidden />
                {TYPE_LABEL[type]}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border/60 px-0">
              {items.length === 0 && (
                <p className="px-4 py-2 text-sm text-muted-foreground">Sin categorías.</p>
              )}
              {items.map((c) => (
                <div
                  key={c.id}
                  className={cn("flex items-center gap-3 px-4 py-2.5", !c.active && "opacity-50")}
                >
                  <CategoryLabel category={c} className="min-w-0 flex-1 font-medium" />
                  {SCOPE_BADGE[c.appliesTo] && (
                    <Badge variant="secondary">{SCOPE_BADGE[c.appliesTo]}</Badge>
                  )}
                  <Switch
                    aria-label={c.active ? "Desactivar" : "Activar"}
                    checked={c.active}
                    onCheckedChange={(active) => toggle.execute({ id: c.id, active })}
                  />
                  <RowMenu
                    deleteLabel={c.name}
                    onEdit={() => setEditing(c)}
                    onDelete={() => remove.execute({ id: c.id })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
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
