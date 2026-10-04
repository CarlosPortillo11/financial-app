import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  if (await getSession()) redirect("/");

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-5xl items-center gap-10 px-4 py-10 md:grid-cols-[1fr_minmax(0,26rem)] md:gap-16 md:px-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-base font-medium text-primary-foreground">
            F
          </span>
          <span className="text-lg font-medium tracking-tight">Finanzas</span>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
            Tu dinero contado por quincenas, no por meses de calendario.
          </h1>
          <p className="max-w-md text-muted-foreground">
            Cada mes empieza el día que cobras. Así sabes qué paga cada salario y cuánto puedes gastar
            hoy sin llegar corto al siguiente pago.
          </p>
        </div>
        <PayCycle />
      </div>
      <div className="w-full">{children}</div>
    </main>
  );
}

function PayCycle() {
  return (
    <figure className="hidden max-w-md flex-col gap-2 md:flex" aria-label="Ejemplo de mes de nómina">
      <div className="flex h-2 overflow-hidden rounded-full">
        <span className="w-[45%] bg-primary" />
        <span className="w-[55%] bg-want" />
      </div>
      <figcaption className="grid grid-cols-[45%_55%] text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">Quincena 1</span>
          <br />
          del 14 al 27
        </span>
        <span>
          <span className="font-medium text-foreground">Quincena 2</span>
          <br />
          del 28 al 13 del mes siguiente
        </span>
      </figcaption>
    </figure>
  );
}
