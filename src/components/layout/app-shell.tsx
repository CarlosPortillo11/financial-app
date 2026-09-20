import { Suspense } from "react";
import type { Category } from "@/db/schema";
import { IconLinks, SidebarNav, TabBar } from "./nav";
import { MonthPicker } from "./month-picker";
import { QuickAdd } from "./quick-add";

export function AppShell({
  categories,
  children,
}: {
  categories: Category[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar p-4 backdrop-blur-xl md:flex">
        <div className="flex items-center gap-2 px-2 pt-1">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            F
          </span>
          <span className="font-semibold tracking-tight">Finanzas</span>
        </div>
        <Suspense>
          <SidebarNav />
        </Suspense>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border/60 bg-background/70 px-3 backdrop-blur-xl md:px-6">
          <Suspense>
            <MonthPicker />
          </Suspense>
          <div className="md:hidden">
            <Suspense>
              <IconLinks />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-3 pt-4 pb-28 md:px-6 md:pt-6 md:pb-10">
          {children}
        </main>
      </div>

      <QuickAdd categories={categories} />
      <Suspense>
        <TabBar />
      </Suspense>
    </div>
  );
}
