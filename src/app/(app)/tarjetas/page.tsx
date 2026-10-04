import { requireSettings } from "@/lib/session";
import { CardList } from "@/components/lists/card-list";
import { getCardStatements } from "@/lib/queries";

export default async function CardsPage() {
  const settings = await requireSettings();
  const rows = await getCardStatements(settings);
  return <CardList rows={rows} />;
}
