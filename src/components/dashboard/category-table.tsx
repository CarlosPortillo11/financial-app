import { TriangleAlertIcon } from "lucide-react";
import { Amount } from "@/components/shared/amount";
import { CategoryLabel } from "@/components/shared/category-label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>Gasto por categoría</CardTitle>
        <CardDescription>Ordenado de mayor a menor. Alerta si supera 15% del ingreso.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto px-0">
        {rows.length === 0 ? (
          <p className="px-6 text-sm text-muted-foreground">Sin gastos registrados este mes.</p>
        ) : (
          <Table>
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
                        className={cn("size-1.5 shrink-0 rounded-full", TYPE_COLOR[r.category.type])}
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
        )}
      </CardContent>
    </Card>
  );
}
