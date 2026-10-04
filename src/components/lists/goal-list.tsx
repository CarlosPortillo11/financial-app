"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { deleteGoal } from "@/actions/goals";
import { GoalForm } from "@/components/forms/goal-form";
import { Amount } from "@/components/shared/amount";
import { Bento, BentoTile } from "@/components/shared/bento";
import { CategoryLabel } from "@/components/shared/category-label";
import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { RowMenu } from "@/components/shared/row-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import type { Category, SavingsGoal } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { useMoney } from "@/components/layout/preferences";
import { pct } from "@/lib/money";
import { formatDate } from "@/lib/period";
import type { GoalProgress } from "@/lib/queries";

type Props = { rows: GoalProgress[]; categories: Category[] };

export function GoalList({ rows, categories }: Props) {
  const money = useMoney();
  const [editing, setEditing] = useState<SavingsGoal | "new" | null>(null);
  const remove = useAction(deleteGoal, feedback("Meta eliminada"));
  const options = categories.filter((c) => c.type === "ahorro_inversion" && c.active);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader
        title="Metas de ahorro"
        description="Cada meta avanza con lo que registras en su categoría de ahorro."
        action={
          <Button onClick={() => setEditing("new")} disabled={!options.length}>
            <PlusIcon data-icon="inline-start" />
            Nueva
          </Button>
        }
      />

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Sin metas todavía</EmptyTitle>
            <EmptyDescription>
              {options.length
                ? "Ponle nombre y monto a lo que quieres juntar: un fondo de emergencia, un viaje, el enganche."
                : "Primero crea una categoría de tipo Ahorro e inversión; ahí registrarás lo que apartes."}
            </EmptyDescription>
          </EmptyHeader>
          {!options.length && (
            <EmptyContent>
              <Button asChild variant="outline">
                <Link href="/categorias">Ir a categorías</Link>
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <Bento className="md:grid-cols-2">
          {rows.map(({ goal, category, saved, monthly }, i) => {
            const ratio = Math.min(1, saved / goal.target);
            const done = saved >= goal.target;
            return (
              <BentoTile key={goal.id} index={i} wide className="gap-4 md:col-span-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{goal.name}</span>
                    <span className="text-xs text-muted-foreground">
                      <CategoryLabel category={category} />
                    </span>
                  </div>
                  <RowMenu
                    deleteLabel={goal.name}
                    onEdit={() => setEditing(goal)}
                    onDelete={() => remove.execute({ id: goal.id })}
                  />
                </div>

                <div className="flex items-end justify-between gap-3">
                  <div className="flex flex-col">
                    <Amount value={saved} className="text-2xl tracking-tight" />
                    <span className="text-xs text-muted-foreground">de {money(goal.target)}</span>
                  </div>
                  <span className="tnum text-3xl font-light tracking-tight text-muted-foreground">
                    {pct(ratio, 0)}
                  </span>
                </div>
                <Progress value={ratio * 100} aria-label={`Avance de ${goal.name}`} />

                <p className="text-sm text-muted-foreground">
                  {done ? (
                    <Badge variant="secondary">Meta cumplida</Badge>
                  ) : monthly !== null ? (
                    <>
                      Aparta <span className="tnum font-medium text-foreground">{money(monthly)}</span> al
                      mes para llegar el {formatDate(goal.deadline!)} de {goal.deadline!.slice(0, 4)}.
                    </>
                  ) : (
                    <>Faltan {money(goal.target - saved)}.</>
                  )}
                </p>
              </BentoTile>
            );
          })}
        </Bento>
      )}

      <ResponsiveModal
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? "Nueva meta" : "Editar meta"}
      >
        <GoalForm
          key={editing === "new" ? "new" : editing?.id}
          categories={options}
          initial={editing === "new" || editing === null ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      </ResponsiveModal>
    </div>
  );
}
