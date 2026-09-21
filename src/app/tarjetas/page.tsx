import { CardList } from "@/components/lists/card-list";
import { getCardStatements } from "@/lib/queries";

export default async function CardsPage() {
  const rows = await getCardStatements();
  return <CardList rows={rows} />;
}
