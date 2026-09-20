import { SettingsForm } from "@/components/forms/settings-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getSettings } from "@/lib/queries";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader
        title="Ajustes"
        description="Metas de la regla 50/30/20 y reparto sugerido del ahorro."
      />
      <Card className="max-w-xl">
        <CardContent>
          <SettingsForm initial={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
