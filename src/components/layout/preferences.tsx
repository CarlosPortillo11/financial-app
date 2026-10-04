"use client";

import { createContext, use } from "react";
import { money } from "@/lib/money";

const CurrencyContext = createContext("MXN");

export function PreferencesProvider({ currency, children }: { currency: string; children: React.ReactNode }) {
  return <CurrencyContext value={currency}>{children}</CurrencyContext>;
}

export function useMoney() {
  const currency = use(CurrencyContext);
  return (n: number) => money(n, currency);
}
