import { PageHeader } from "@/components/shared/page-header";
import { CheckinForm } from "@/components/review/checkin-form";
import { WeeklyReviewForm } from "@/components/review/weekly-review-form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { computeWeeklyScore } from "@/lib/score";
import { weekStart, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const user = await getCurrentUser();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ws = weekStart(today);

  const [todayCheckin, thisWeekReview, thisWeekCommitments, pastReviews] = await Promise.all([
    prisma.dailyCheckin.findUnique({
      where: { userId_date: { userId: user.id, date: today } },
    }),
    prisma.weeklyReview.findUnique({
      where: { userId_weekStart: { userId: user.id, weekStart: ws } },
    }),
    prisma.weeklyCommitment.findMany({
      where: { userId: user.id, weekStart: ws },
    }),
    prisma.weeklyReview.findMany({
      where: { userId: user.id, weekStart: { lt: ws } },
      orderBy: { weekStart: "desc" },
      take: 6,
    }),
  ]);

  const score = computeWeeklyScore(thisWeekCommitments, user);

  return (
    <div>
      <PageHeader
        title="Review"
        description="Daily check-ins and weekly retrospectives. The loop that makes everything else work."
      />

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily check-in</TabsTrigger>
          <TabsTrigger value="weekly">Weekly review</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4">
              <div className="text-sm font-semibold">Today's check-in</div>
              <div className="text-[11px] text-muted-foreground">
                {todayCheckin ? "Saved earlier — edit and save again to update." : "Write it once, refer back all day."}
              </div>
            </div>
            <CheckinForm existing={todayCheckin} />
          </div>
        </TabsContent>

        <TabsContent value="weekly">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4">
              <div className="text-sm font-semibold">Week of {formatDate(ws)}</div>
              <div className="text-[11px] text-muted-foreground">
                Score is auto-computed from weekly commitments. Write the narrative, save, repeat.
              </div>
            </div>
            <WeeklyReviewForm
              existing={thisWeekReview}
              weekStart={ws.toISOString()}
              score={score}
            />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <div className="text-sm font-semibold">Past reviews</div>
            </div>
            {pastReviews.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No past reviews yet.</div>
            ) : (
              <ul className="divide-y divide-border">
                {pastReviews.map((r) => (
                  <li key={r.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-start md:gap-4">
                    <div className="w-24 shrink-0 text-[11px] text-muted-foreground md:text-sm">
                      {formatDate(r.weekStart)}
                    </div>
                    <div className="flex-1 space-y-1 text-xs">
                      {r.wins ? (
                        <div>
                          <span className="text-[hsl(var(--success))]">Wins:</span> {r.wins}
                        </div>
                      ) : null}
                      {r.lessons ? (
                        <div>
                          <span className="text-muted-foreground">Lessons:</span> {r.lessons}
                        </div>
                      ) : null}
                      {r.nextWeekFocus ? (
                        <div>
                          <span className="text-muted-foreground">Next focus:</span> {r.nextWeekFocus}
                        </div>
                      ) : null}
                    </div>
                    <div className="shrink-0 rounded-md border border-border bg-background/40 px-2 py-1 text-xs font-semibold tabular-nums">
                      {r.totalScore}/100
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
