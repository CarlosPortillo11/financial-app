import { Suspense, ViewTransition } from "react";
import type { Card, Category } from "@/db/schema";
import type { Schedule } from "@/lib/period";
import { SidebarNav, TabBar } from "./nav";
import { MonthPicker } from "./month-picker";
import { MotionRoot } from "./motion-root";
import { QuickAdd } from "./quick-add";
import { UserMenu, type SessionUser } from "./user-menu";

/** El contenido va directo sobre el cristal: no hay marco ni tarjeta contenedora.
 *  A la izquierda, el rail de iconos despegado del borde. Ver design/DESIGN.md. */
export function AppShell({
  categories,
  cards,
  payDays,
  user,
  children,
}: {
  categories: Category[];
  cards: Card[];
  payDays: Schedule;
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-10 flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh shrink-0 flex-col gap-8 py-6 pr-2 pl-5 md:flex">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-[1.125rem] bg-primary text-base font-medium text-primary-foreground">
          F
        </span>
        <Suspense>
          <SidebarNav />
        </Suspense>
        <UserMenu user={user} className="size-14 shrink-0 text-base" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 glass-bar px-4 md:h-20 md:px-8">
          <Suspense>
            <MonthPicker payDays={payDays} />
          </Suspense>
          <UserMenu user={user} className="ml-auto size-11 shrink-0 md:hidden" />
        </header>
        <main className="flex-1 px-4 pb-28 md:px-8 md:pb-10">
          <ViewTransition enter="genie" exit="genie" default="none">
            <MotionRoot>{children}</MotionRoot>
          </ViewTransition>
        </main>
      </div>

      <QuickAdd categories={categories} cards={cards} />
      <Suspense>
        <TabBar />
      </Suspense>
    </div>
  );
}
