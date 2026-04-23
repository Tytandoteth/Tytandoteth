import Link from "next/link";
import {
  DollarSign,
  TrendingDown,
  Timer,
  Briefcase,
  Dumbbell,
  FileText,
  Target,
  Rocket,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { FinanceChart } from "@/components/dashboard/finance-chart";
import { WeeklyScoreCard } from "@/components/dashboard/weekly-score";
import { NextActions } from "@/components/dashboard/next-actions";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getDashboardData } from "@/lib/queries";
import { formatCurrency, formatNumber, formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { stats, weeklyScore, goals, todayCheckin, latestVenture, financeSeries } = data;

  const runwayLabel =
    !isFinite(stats.runwayMonths)
      ? "∞"
      : `${formatNumber(stats.runwayMonths, { digits: 1 })}`;

  const runwayTone =
    !isFinite(stats.runwayMonths) || stats.runwayMonths >= 9
      ? "success"
      : stats.runwayMonths >= 4
        ? "warning"
        : "destructive";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good ${greeting()}, ${data.user.name ?? "operator"}.`}
        description={"Where you stand, what matters this week, what to do next."}
      />

      {/* Top-line stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Liquid cash"
          value={formatCurrency(stats.liquidCash, { compact: true })}
          hint={`Net ${formatCurrency(stats.incomeMonth - stats.expenseMonth, { compact: true })} this month`}
          icon={DollarSign}
        />
        <StatCard
          label="Monthly burn"
          value={formatCurrency(stats.monthlyBurn, { compact: true })}
          hint={`Target ${formatCurrency(data.user.monthlyBurnTarget, { compact: true })}`}
          icon={TrendingDown}
          tone={stats.monthlyBurn <= data.user.monthlyBurnTarget ? "success" : "warning"}
        />
        <StatCard
          label="Runway"
          value={<span>{runwayLabel}<span className="ml-1 text-base text-muted-foreground">mo</span></span>}
          hint="Based on trailing 30d net burn"
          icon={Timer}
          tone={runwayTone as any}
        />
        <StatCard
          label="Apps this week"
          value={stats.weekJobApps}
          hint={`${stats.activeInterviews} active interviews`}
          icon={Briefcase}
        />
        <StatCard
          label="Workouts this week"
          value={stats.weekWorkouts}
          hint="Completed sessions"
          icon={Dumbbell}
        />
        <StatCard
          label="Posts this week"
          value={stats.weekPosts}
          hint="Shipped content"
          icon={FileText}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <div className="text-sm font-semibold">Liquid cash — last 30 days</div>
              <div className="text-[11px] text-muted-foreground">
                Daily cumulative position from income and expenses
              </div>
            </div>
            <Link
              href="/finance"
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Open finance →
            </Link>
          </div>
          <div className="px-2 py-4">
            <FinanceChart data={financeSeries} />
          </div>
        </div>

        <WeeklyScoreCard score={weeklyScore} />
      </div>

      {/* Secondary grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <NextActions actions={data.nextActions} />

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">Today's priorities</div>
            <Link href="/review" className="text-[11px] text-muted-foreground hover:text-foreground">
              Edit →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {todayCheckin ? (
              [todayCheckin.topPriority1, todayCheckin.topPriority2, todayCheckin.topPriority3].map(
                (p, i) =>
                  p ? (
                    <div key={i} className="flex items-start gap-3 px-4 py-3">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded border border-border text-[10px] font-semibold">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-tight">{p}</span>
                    </div>
                  ) : null,
              )
            ) : (
              <div className="px-4 py-6 text-sm text-muted-foreground">
                No check-in yet today.{" "}
                <Link href="/review" className="text-foreground underline underline-offset-2">
                  Write one
                </Link>
                .
              </div>
            )}
            {todayCheckin ? (
              <div className="grid grid-cols-2 gap-3 px-4 py-3 text-[11px] text-muted-foreground">
                <div>
                  Energy{" "}
                  <span className="text-foreground">{todayCheckin.energyLevel ?? "—"}/5</span>
                </div>
                <div>
                  Stress{" "}
                  <span className="text-foreground">{todayCheckin.stressLevel ?? "—"}/5</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">Latest venture metric</div>
            <Link href="/venture" className="text-[11px] text-muted-foreground hover:text-foreground">
              View →
            </Link>
          </div>
          {latestVenture ? (
            <div className="space-y-3 p-4">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {latestVenture.ventureName}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <div className="text-2xl font-semibold tabular-nums">
                    {formatNumber(latestVenture.metricValue, { compact: true })}
                  </div>
                  <div className="text-xs text-muted-foreground">{latestVenture.metricName}</div>
                </div>
              </div>
              {latestVenture.priority ? (
                <div className="rounded-md border border-border bg-background/50 p-2 text-xs">
                  <div className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Priority
                  </div>
                  {latestVenture.priority}
                </div>
              ) : null}
              {latestVenture.blocker ? (
                <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs">
                  <Rocket className="mt-0.5 h-3 w-3 text-destructive" />
                  <span>{latestVenture.blocker}</span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">No venture updates yet.</div>
          )}
        </div>
      </div>

      {/* 90-day goals */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-semibold">Current 90-day goals</div>
          </div>
          <Link href="/goals" className="text-[11px] text-muted-foreground hover:text-foreground">
            Manage →
          </Link>
        </div>
        {goals.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            Define 2-3 90-day goals.{" "}
            <Link href="/goals" className="text-foreground underline underline-offset-2">
              Start now
            </Link>
            .
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {goals.map((g) => {
              const pct =
                g.targetValue && g.targetValue > 0 && g.currentValue !== null
                  ? Math.min(100, Math.max(0, ((g.currentValue ?? 0) / g.targetValue) * 100))
                  : 0;
              return (
                <li key={g.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {g.category}
                      </Badge>
                      <div className="text-sm font-medium">{g.title}</div>
                    </div>
                    {g.description ? (
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{g.description}</div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 sm:w-64">
                    <Progress value={pct} className="flex-1" />
                    <div className="w-16 text-right text-[11px] tabular-nums text-muted-foreground">
                      {g.currentValue ?? 0}/{g.targetValue ?? "—"} {g.unit ?? ""}
                    </div>
                  </div>
                  <div className="w-20 text-right text-[11px] text-muted-foreground">
                    {g.dueDate ? formatRelative(g.dueDate) : "no due"}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
