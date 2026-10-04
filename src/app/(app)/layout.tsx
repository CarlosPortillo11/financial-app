import { AppShell } from "@/components/layout/app-shell";
import { DueAlert } from "@/components/layout/due-alert";
import { PreferencesProvider } from "@/components/layout/preferences";
import { getCards, getCardStatements, getCategories, getDueFixed } from "@/lib/queries";
import { requireSettings, requireUser } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const [user, settings] = await Promise.all([requireUser(), requireSettings()]);
  const [categories, cards, statements, dueFixed] = await Promise.all([
    getCategories(user.id, true),
    getCards(user.id),
    getCardStatements(settings),
    getDueFixed(settings),
  ]);
  return (
    <PreferencesProvider currency={settings.currency}>
      <AppShell categories={categories} cards={cards} payDays={settings} user={user}>
        {children}
      </AppShell>
      <DueAlert cards={statements.filter((s) => s.alert)} fixed={dueFixed} />
    </PreferencesProvider>
  );
}
