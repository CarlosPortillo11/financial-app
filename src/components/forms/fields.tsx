"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import type { Category } from "@/db/schema";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryLabel } from "@/components/shared/category-label";

type Base<T extends FieldValues> = { control: Control<T>; name: Path<T>; label: string };

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  autoFocus,
}: Base<T> & { placeholder?: string; autoFocus?: boolean }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            {...field}
            id={field.name}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export function NumberField<T extends FieldValues>({
  control,
  name,
  label,
  step = "0.01",
  min,
  max,
  prefix,
  autoFocus,
}: Base<T> & { step?: string; min?: number; max?: number; prefix?: string; autoFocus?: boolean }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <div className="relative">
            {prefix && (
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                {prefix}
              </span>
            )}
            <Input
              id={field.name}
              name={field.name}
              ref={field.ref}
              type="number"
              inputMode="decimal"
              step={step}
              min={min}
              max={max}
              autoFocus={autoFocus}
              className={prefix ? "pl-7 tnum" : "tnum"}
              value={Number.isFinite(field.value) ? field.value : ""}
              onBlur={field.onBlur}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              aria-invalid={fieldState.invalid}
            />
          </div>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export function DateField<T extends FieldValues>({ control, name, label }: Base<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input {...field} id={field.name} type="date" aria-invalid={fieldState.invalid} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = "Elige",
  numeric,
}: Base<T> & {
  options: { value: string; label: React.ReactNode }[];
  placeholder?: string;
  /** El valor del form es número; Select trabaja con strings. */
  numeric?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Select
            name={field.name}
            value={field.value == null || field.value === "" ? "" : String(field.value)}
            onValueChange={(v) => field.onChange(numeric ? Number(v) : v)}
          >
            <SelectTrigger id={field.name} className="w-full" aria-invalid={fieldState.invalid}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                {options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export function CategoryField<T extends FieldValues>({
  categories,
  ...props
}: Base<T> & { categories: Category[] }) {
  return (
    <SelectField
      {...props}
      numeric
      placeholder="Categoría"
      options={categories.map((c) => ({
        value: String(c.id),
        label: <CategoryLabel category={c} />,
      }))}
    />
  );
}
