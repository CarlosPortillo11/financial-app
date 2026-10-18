import { TriangleAlertIcon } from "lucide-react";
import { Amount } from "@/components/shared/amount";
import { CategoryLabel } from "@/components/shared/category-label";
import { Badge } from "@/components/ui/badge";
import { FolderPanel } from "@/components/shared/folder-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CategorySummary } from "@/lib/calc";
import { TYPE_COLOR } from "@/lib/labels";
import { pct } from "@/lib/money";
import { cn } from "@/lib/utils";

export function CategoryTable({ rows }: { rows: CategorySummary[] }) {
  return (
    <FolderPanel
      title="Gasto por categoría"
      description="Ordenado de mayor a menor. Alerta si supera 15% del ingreso."
      bodyClassName="px-0 py-5 md:py-6"
    >
      {rows.length === 0 ? (
        <p className="px-5 text-sm text-muted-foreground md:px-6">
          Sin gastos registrados este mes.
        </p>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-border/60 md:hidden">
            {rows.map((r, i) => (
              <li key={r.category.id} className="flex flex-col gap-1.5 px-4 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <CategoryLabel category={r.category} className="min-w-0 font-medium" />
                  <Amount value={r.total} className="font-medium" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "grow-x h-full rounded-full",
                        r.high ? "bg-destructive" : TYPE_COLOR[r.category.type],
                      )}
                      style={{
                        width: `${Math.min(100, r.pctOfSpent * 100)}%`,
                        "--i": i,
                      } as React.CSSProperties}
                    />
                  </div>
                  <span className="tnum">{pct(r.pctOfSpent, 0)} del gasto</span>
                  <span className={cn("tnum", r.high && "font-medium text-destructive")}>
                    {pct(r.pctOfIncome, 0)} del ingreso
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Categoría</TableHead>
                <TableHead className="text-right">Fijo</TableHead>
                <TableHead className="text-right">Variable</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">% gasto</TableHead>
                <TableHead className="pr-6 text-right">% ingreso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.category.id}>
                  <TableCell className="pl-6">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          TYPE_COLOR[r.category.type],
                        )}
                        aria-hidden
                      />
                      <CategoryLabel category={r.category} />
                      {r.high && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="destructive" className="gap-1">
                              <TriangleAlertIcon />
                              Alto
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>Supera 15% del ingreso, considera reducir</TooltipContent>
                        </Tooltip>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    <Amount value={r.fixed} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    <Amount value={r.variable} />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <Amount value={r.total} />
                  </TableCell>
                  <TableCell className="tnum text-right">{pct(r.pctOfSpent)}</TableCell>
                  <TableCell
                    className={cn("tnum pr-6 text-right", r.high && "font-medium text-destructive")}
                  >
                    {pct(r.pctOfIncome)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </FolderPanel>
  );
}
