"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { signIn, signUp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { feedback } from "@/lib/action-feedback";
import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from "@/schemas";
import { TextField } from "./fields";

function useEnterApp() {
  const router = useRouter();
  return {
    onSuccess: () => {
      router.replace("/");
      router.refresh();
    },
    onError: feedback("").onError,
  };
}

export function SignInForm() {
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const { execute, isPending } = useAction(signIn, useEnterApp());

  return (
    <form onSubmit={form.handleSubmit((d) => execute(d))}>
      <FieldGroup className="gap-4">
        <TextField control={form.control} name="email" label="Correo" type="email" autoComplete="email" autoFocus />
        <TextField
          control={form.control}
          name="password"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Spinner data-icon="inline-start" />}
          Entrar
        </Button>
        <FieldDescription className="text-center">
          ¿No tienes cuenta? <Link href="/registro">Crea una</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}

export function SignUpForm() {
  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const { execute, isPending } = useAction(signUp, useEnterApp());

  return (
    <form onSubmit={form.handleSubmit((d) => execute(d))}>
      <FieldGroup className="gap-4">
        <TextField control={form.control} name="name" label="Nombre" autoComplete="name" autoFocus />
        <TextField control={form.control} name="email" label="Correo" type="email" autoComplete="email" />
        <TextField
          control={form.control}
          name="password"
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Spinner data-icon="inline-start" />}
          Crear cuenta
        </Button>
        <FieldDescription className="text-center">
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
