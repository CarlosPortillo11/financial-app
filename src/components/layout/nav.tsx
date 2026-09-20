"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

function useHref() {
  const params = useSearchParams();
  const m = params.get("m");
  return (href: string) => (m ? `${href}?m=${m}` : href);
}

export function SidebarNav() {
  const pathname = usePathname();
  const href = useHref();
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Principal">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={href(item.href)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function TabBar() {
  const pathname = usePathname();
  const href = useHref();
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border bg-sidebar pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
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
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground",
                  active && "text-primary",
                )}
              >
                <item.icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function IconLinks() {
  const href = useHref();
  return (
    <div className="flex items-center gap-1">
      {NAV.slice(5).map((item) => (
        <Link
          key={item.href}
          href={href(item.href)}
          aria-label={item.label}
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <item.icon className="size-5" />
        </Link>
      ))}
    </div>
  );
}
