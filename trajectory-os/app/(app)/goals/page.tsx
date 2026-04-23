import { PageHeader } from "@/components/shared/page-header";
import { GoalsView } from "@/components/goals/goals-view";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { weekStart } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const userId = await getCurrentUserId();
  const ws = weekStart();
  const [goals, commitments] = await Promise.all([
    prisma.goal.findMany({
      where: { userId },
      orderBy: [{ timeframe: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    }),
    prisma.weeklyCommitment.findMany({
      where: { userId, weekStart: ws },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const northStar = goals.filter((g) => g.timeframe === "north_star");
  const ninetyDay = goals.filter((g) => g.timeframe === "ninety_day");

  return (
    <div>
      <PageHeader
        title="Goals"
        description="North star, 90-day objectives, and weekly commitments."
      />
      <GoalsView northStar={northStar} ninetyDay={ninetyDay} commitments={commitments} />
    </div>
  );
}
