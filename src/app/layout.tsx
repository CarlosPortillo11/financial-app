import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCategories } from "@/lib/queries";

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
  const categories = await getCategories(true);
  return (
    <html lang="es" className={`${geist.variable} h-full font-sans antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <AppShell categories={categories}>{children}</AppShell>
        </TooltipProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
