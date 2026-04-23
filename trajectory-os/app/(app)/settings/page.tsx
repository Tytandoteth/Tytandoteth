import { PageHeader } from "@/components/shared/page-header";
import { SettingsForm } from "@/components/settings/settings-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Finance defaults, score weights, and appearance."
      />
      <SettingsForm user={user} />
    </div>
  );
}
