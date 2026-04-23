import { PageHeader } from "@/components/shared/page-header";
import { ContentView } from "@/components/content/content-view";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const userId = await getCurrentUserId();
  const items = await prisma.contentItem.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }],
  });

  return (
    <div>
      <PageHeader
        title="Content"
        description="Ideas, drafts, and publishes. Move things right. Ship daily."
      />
      <ContentView items={items} />
    </div>
  );
}
