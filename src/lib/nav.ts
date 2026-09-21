import {
  CalendarClockIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  LightbulbIcon,
  ReceiptIcon,
  Settings2Icon,
  TagsIcon,
  WalletIcon,
} from "lucide-react";

export const NAV = [
  { href: "/", label: "Resumen", icon: LayoutDashboardIcon },
  { href: "/fijos", label: "Fijos", icon: CalendarClockIcon },
  { href: "/variables", label: "Variables", icon: ReceiptIcon },
  { href: "/ingresos", label: "Ingresos", icon: WalletIcon },
  { href: "/consejos", label: "Consejos", icon: LightbulbIcon },
  { href: "/tarjetas", label: "Tarjetas", icon: CreditCardIcon },
  { href: "/categorias", label: "Categorías", icon: TagsIcon },
  { href: "/ajustes", label: "Ajustes", icon: Settings2Icon },
] as const;

/** Rutas que muestran datos de un mes y reciben ?m=YYYY-MM. */
export const MONTHLY_ROUTES = ["/", "/fijos", "/variables", "/ingresos", "/consejos"];
