"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { updateSettings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { Settings } from "@/db/schema";
import { feedback } from "@/lib/action-feedback";
import { settingsSchema, type SettingsInput } from "@/schemas";
import { CURRENCY_OPTIONS, TIME_ZONE_OPTIONS } from "@/lib/labels";
import { NumberField, SelectField, SwitchField } from "./fields";

export function SettingsForm({ initial }: { initial: Settings }) {
  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      needsPct: initial.needsPct,
      wantsPct: initial.wantsPct,
      savingsPct: initial.savingsPct,
      savingSplitPct: initial.savingSplitPct,
      investSplitPct: initial.investSplitPct,
      payDay1: initial.payDay1,
      payDay2: initial.payDay2,
      carryBalance: initial.carryBalance,
      timeZone: initial.timeZone,
      currency: initial.currency,
    },
  });
  const { execute, isPending } = useAction(updateSettings, feedback("Ajustes guardados"));
  const c = form.control;

  return (
    <form onSubmit={form.handleSubmit((d) => execute(d))}>
      <FieldGroup className="gap-6">
        <FieldSet>
          <FieldLegend>Reparto del ingreso</FieldLegend>
          <div className="grid grid-cols-3 gap-3">
            <NumberField control={c} name="needsPct" label="Necesidades %" step="1" min={0} max={100} />
            <NumberField control={c} name="wantsPct" label="Deseos %" step="1" min={0} max={100} />
            <NumberField control={c} name="savingsPct" label="Ahorro %" step="1" min={0} max={100} />
          </div>
        </FieldSet>
        <FieldSet>
          <FieldLegend>Reparto del ahorro</FieldLegend>
          <div className="grid grid-cols-2 gap-3">
            <NumberField control={c} name="savingSplitPct" label="Ahorro %" step="1" min={0} max={100} />
            <NumberField control={c} name="investSplitPct" label="Inversión %" step="1" min={0} max={100} />
          </div>
        </FieldSet>
        <FieldSet>
          <FieldLegend>Días de pago</FieldLegend>
          <FieldDescription>
            Quincena 1 va del primer pago al día antes del segundo; Quincena 2 cubre el resto, incluido el inicio del mes siguiente.
          </FieldDescription>
          <div className="grid grid-cols-2 gap-3">
            <NumberField control={c} name="payDay1" label="Primer pago (día)" step="1" min={1} max={31} />
            <NumberField control={c} name="payDay2" label="Segundo pago (día)" step="1" min={1} max={31} />
          </div>
        </FieldSet>
        <FieldSet>
          <FieldLegend>Región</FieldLegend>
          <FieldDescription>
            La zona horaria decide qué día es hoy para tus quincenas y avisos.
          </FieldDescription>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField control={c} name="timeZone" label="Zona horaria" options={TIME_ZONE_OPTIONS} />
            <SelectField control={c} name="currency" label="Moneda" options={CURRENCY_OPTIONS} />
          </div>
        </FieldSet>
        <SwitchField
          control={c}
          name="carryBalance"
          label="Arrastrar saldo"
          description="Lo que sobró o faltó en meses anteriores se suma a lo disponible de este mes."
        />
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto sm:self-start">
          {isPending && <Spinner data-icon="inline-start" />}
          Guardar ajustes
        </Button>
      </FieldGroup>
    </form>
  );
}
