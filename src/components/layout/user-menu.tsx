"use client";

import { CompassIcon, LogOutIcon, Settings2Icon } from "lucide-react";
import { openTour } from "@/components/onboarding/tour";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

export type SessionUser = { name: string; email: string };

export function UserMenu({ user, className }: { user: SessionUser; className?: string }) {
  const router = useRouter();
  const initial = (user.name || user.email).trim().charAt(0).toUpperCase();

  const signOut = async () => {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Cuenta de ${user.name}`}
        className={cn(
          "flex items-center justify-center rounded-full bg-primary font-medium text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          className,
        )}
      >
        {initial}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" className="min-w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate font-medium text-foreground">{user.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="md:hidden">
          {NAV.slice(5, 8).map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>
                <item.icon />
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/ajustes">
              <Settings2Icon />
              Ajustes
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={openTour}>
            <CompassIcon />
            Ver recorrido
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={signOut}>
            <LogOutIcon />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
