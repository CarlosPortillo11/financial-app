"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ViewTransition } from "react";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

function useHref() {
  const params = useSearchParams();
  const m = params.get("m");
  return (href: string) => (m ? `${href}?m=${m}` : href);
}

type Item = (typeof NAV)[number];

/** Rail de iconos: cuadrados redondeados despegados del borde. El activo es
 *  blanco puro y se desliza al ítem nuevo al navegar (ViewTransition). */
function RailItem({ item, active, href }: { item: Item; active: boolean; href: string }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group/rail rail-item relative flex size-14 items-center justify-center rounded-[1.125rem] text-sidebar-foreground/70",
          active
            ? "text-sidebar-accent-foreground"
            : "bg-white/35 hover:bg-white/60 hover:text-sidebar-foreground dark:bg-white/6 dark:hover:bg-white/12",
        )}
      >
        {active && (
          <ViewTransition name="rail-active">
            <span
              aria-hidden
              className="absolute inset-0 rounded-[1.125rem] bg-sidebar-accent shadow-[0_6px_20px_oklch(0_0_0/8%)]"
            />
          </ViewTransition>
        )}
        <item.icon className="relative size-5.5" strokeWidth={1.5} />
        <span className="rail-label pointer-events-none absolute left-[calc(100%+0.625rem)] z-20 rounded-xl bg-popover px-3 py-1.5 text-sm whitespace-nowrap opacity-0 shadow-[0_8px_24px_oklch(0_0_0/10%)] backdrop-blur-xl">
          {item.label}
        </span>
      </Link>
    </li>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  const href = useHref();
  const render = (item: Item) => (
    <RailItem key={item.href} item={item} active={pathname === item.href} href={href(item.href)} />
  );
  return (
    <nav className="flex flex-1 flex-col justify-between" aria-label="Principal">
      <ul className="flex flex-col gap-3">{NAV.slice(0, 7).map(render)}</ul>
      <ul className="flex flex-col gap-3">{NAV.slice(7).map(render)}</ul>
    </nav>
  );
}

export function TabBar() {
  const pathname = usePathname();
  const href = useHref();
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-40 glass-bar-bottom pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={href(item.href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground",
                  active && "text-foreground",
                )}
              >
                <item.icon className="size-5" strokeWidth={active ? 2 : 1.5} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
