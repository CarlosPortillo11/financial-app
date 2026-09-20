import { CategoryList } from "@/components/lists/category-list";
import { getCategories } from "@/lib/queries";

export default async function CategoriesPage() {
  const rows = await getCategories();
  return <CategoryList rows={rows} />;
}
