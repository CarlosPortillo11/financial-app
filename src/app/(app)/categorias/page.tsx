import { requireSettings } from "@/lib/session";
import { CategoryList } from "@/components/lists/category-list";
import { getCategories } from "@/lib/queries";

export default async function CategoriesPage() {
  const settings = await requireSettings();
  const rows = await getCategories(settings.userId);
  return <CategoryList rows={rows} />;
}
