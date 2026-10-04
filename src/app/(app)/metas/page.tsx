import { requireSettings } from "@/lib/session";
import { GoalList } from "@/components/lists/goal-list";
import { getCategories, getGoals } from "@/lib/queries";

export default async function GoalsPage() {
  const settings = await requireSettings();
  const [rows, categories] = await Promise.all([getGoals(settings), getCategories(settings.userId)]);
  return <GoalList rows={rows} categories={categories} />;
}
