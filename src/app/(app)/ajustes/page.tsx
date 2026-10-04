import { requireSettings } from "@/lib/session";
import { SettingsForm } from "@/components/forms/settings-form";
import { PageHeader } from "@/components/shared/page-header";
import { FolderPanel } from "@/components/shared/folder-panel";

export default async function SettingsPage() {
  const settings = await requireSettings();
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader
        title="Ajustes"
        description="Metas de la regla 50/30/20 y reparto sugerido del ahorro."
      />
      <FolderPanel title="Preferencias" className="max-w-xl">
        <SettingsForm initial={settings} />
      </FolderPanel>
    </div>
  );
}
