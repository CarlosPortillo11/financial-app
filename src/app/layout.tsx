import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { CardDueAlert } from "@/components/layout/card-due-alert";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCards, getCardStatements, getCategories } from "@/lib/queries";

// Todo lee de la DB por request; nada se prerenderiza en build (Railway no tendrá DB al compilar).
export const dynamic = "force-dynamic";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Finanzas",
  description: "Presupuesto personal por quincenas",
};

export const viewport: Viewport = {
  themeColor: "#eef4f4",
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [categories, cards, statements] = await Promise.all([
    getCategories(true),
    getCards(),
    getCardStatements(),
  ]);
  return (
    <html lang="es" className={`${geist.variable} h-full font-sans antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <AppShell categories={categories} cards={cards}>
            {children}
          </AppShell>
          <CardDueAlert due={statements.filter((s) => s.alert)} />
        </TooltipProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
