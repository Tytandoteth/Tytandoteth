import { PageHeader } from "@/components/shared/page-header";
import { JobsView } from "@/components/jobs/jobs-view";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const userId = await getCurrentUserId();
  const leads = await prisma.jobLead.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }],
  });

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="Pipeline CRM. Stage, probability, and the next concrete action."
      />
      <JobsView leads={leads} />
    </div>
  );
}
