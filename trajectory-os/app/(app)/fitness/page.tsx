import { Check, X, Dumbbell, Flame, Scale, Target as TargetIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { BodyweightChart } from "@/components/fitness/bodyweight-chart";
import { WorkoutDialog } from "@/components/fitness/workout-dialog";
import { WorkoutDelete } from "@/components/fitness/workout-delete";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { formatDate, weekStart } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FitnessPage() {
  const userId = await getCurrentUserId();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [workouts, weekWorkouts] = await Promise.all([
    prisma.workout.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    }),
    prisma.workout.findMany({
      where: { userId, completed: true, date: { gte: weekStart() } },
    }),
  ]);

  const bwData = [...workouts]
    .filter((w) => w.bodyweight != null)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((w) => ({ date: w.date.toISOString().slice(0, 10), bw: w.bodyweight! }));

  const streak = computeStreak(workouts);
  const weeklyCount = weekWorkouts.length;
  const last30 = workouts.filter((w) => w.completed).length;
  const proteinHitRate =
    workouts.length > 0
      ? Math.round((workouts.filter((w) => w.proteinHit).length / workouts.length) * 100)
      : 0;
  const creatineRate =
    workouts.length > 0
      ? Math.round((workouts.filter((w) => w.creatineTaken).length / workouts.length) * 100)
      : 0;
  const latestBw = bwData.at(-1)?.bw ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fitness"
        description="Consistency, not intensity. Track streak, bodyweight, habits."
        action={<WorkoutDialog />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard
          label="This week"
          value={`${weeklyCount}`}
          hint="sessions"
          icon={Dumbbell}
          tone={weeklyCount >= 4 ? "success" : weeklyCount >= 2 ? "warning" : "destructive"}
        />
        <StatCard label="Streak" value={`${streak}d`} hint="consecutive active days" icon={Flame} />
        <StatCard label="30-day sessions" value={last30} hint="completed" icon={TargetIcon} />
        <StatCard label="Bodyweight" value={latestBw ? `${latestBw}` : "—"} hint="lb, last logged" icon={Scale} />
        <StatCard label="Protein hit" value={`${proteinHitRate}%`} hint={`Creatine ${creatineRate}%`} icon={Check} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-lg border border-border bg-card lg:col-span-3">
          <div className="border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">Bodyweight — last 30 days</div>
            <div className="text-[11px] text-muted-foreground">Tracks recomp trend, not daily noise.</div>
          </div>
          <div className="p-2">
            {bwData.length > 1 ? (
              <BodyweightChart data={bwData} />
            ) : (
              <EmptyState
                title="Not enough data"
                description="Log bodyweight for a few days to see the chart."
              />
            )}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card lg:col-span-2">
          <div className="border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">Weekly rhythm</div>
            <div className="text-[11px] text-muted-foreground">Last 14 days at a glance.</div>
          </div>
          <div className="p-4">
            <HabitGrid workouts={workouts.slice(0, 14)} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-semibold">Recent workouts</div>
          <WorkoutDialog />
        </div>
        {workouts.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Dumbbell} title="No workouts logged yet" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">BW</TableHead>
                <TableHead>Habits</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {workouts.slice(0, 20).map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(w.date)}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {w.completed ? (
                        <Check className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      {w.workoutType}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {w.durationMin ? `${w.durationMin} min` : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{w.bodyweight ?? "—"}</TableCell>
                  <TableCell className="space-x-1">
                    {w.proteinHit ? <Badge variant="outline">protein</Badge> : null}
                    {w.creatineTaken ? <Badge variant="outline">creatine</Badge> : null}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <WorkoutDialog workout={w} />
                      <WorkoutDelete id={w.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function HabitGrid({ workouts }: { workouts: { date: Date; completed: boolean }[] }) {
  const days: { label: string; done: boolean; date: string }[] = [];
  const map = new Map(workouts.map((w) => [w.date.toISOString().slice(0, 10), w.completed]));
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
      date: key,
      done: map.get(key) === true,
    });
  }
  return (
    <div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div
            key={i}
            title={d.date}
            className={
              "flex h-8 items-center justify-center rounded border text-[10px] " +
              (d.done
                ? "border-[hsl(var(--success))]/40 bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]"
                : "border-border bg-background/40 text-muted-foreground")
            }
          >
            {d.label}
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-muted-foreground">Each square = one day. Filled = completed workout.</div>
    </div>
  );
}

function computeStreak(workouts: { date: Date; completed: boolean }[]): number {
  const done = new Set(
    workouts.filter((w) => w.completed).map((w) => w.date.toISOString().slice(0, 10)),
  );
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (done.has(key)) streak++;
    else if (i > 0) break;
  }
  return streak;
}
