import { AlertTriangle, Rocket, Target as TargetIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { VentureDialog } from "@/components/venture/venture-dialog";
import { VentureDelete } from "@/components/venture/venture-delete";
import { VentureChart } from "@/components/venture/venture-chart";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { formatDate, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VenturePage() {
  const userId = await getCurrentUserId();
  const updates = await prisma.ventureUpdate.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  if (updates.length === 0) {
    return (
      <div>
        <PageHeader
          title="Venture"
          description="Weekly cadence: one metric, one priority, one blocker."
          action={<VentureDialog />}
        />
        <EmptyState
          icon={Rocket}
          title="No venture updates yet"
          description="Log a weekly snapshot: the metric you care about, the priority, the blocker."
          action={<VentureDialog />}
        />
      </div>
    );
  }

  const latest = updates[0];
  const prev = updates[1];
  const delta = prev ? latest.metricValue - prev.metricValue : null;
  const deltaPct = prev && prev.metricValue !== 0 ? (delta! / prev.metricValue) * 100 : null;

  const chronological = [...updates].reverse();
  const chartData = chronological.map((u) => ({
    date: u.date.toISOString().slice(0, 10),
    value: u.metricValue,
  }));

  const blockers = updates.filter((u) => u.blocker).slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Venture"
        description="Weekly cadence: one metric, one priority, one blocker."
        action={<VentureDialog />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-label">{latest.ventureName}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <div className="text-3xl font-semibold tabular-nums">
                  {formatNumber(latest.metricValue, { compact: true })}
                </div>
                <div className="text-xs text-muted-foreground">{latest.metricName}</div>
              </div>
              {delta !== null ? (
                <div
                  className={
                    "mt-2 text-xs " +
                    (delta > 0
                      ? "text-[hsl(var(--success))]"
                      : delta < 0
                        ? "text-destructive"
                        : "text-muted-foreground")
                  }
                >
                  {delta > 0 ? "+" : ""}
                  {formatNumber(delta)} vs. last update
                  {deltaPct !== null ? ` (${deltaPct > 0 ? "+" : ""}${deltaPct.toFixed(1)}%)` : null}
                </div>
              ) : null}
            </div>
            <div className="text-[11px] text-muted-foreground">{formatDate(latest.date)}</div>
          </div>
          {latest.priority ? (
            <div className="mt-4 rounded-md border border-border bg-background/50 p-3 text-sm">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <TargetIcon className="h-3 w-3" />
                Priority
              </div>
              {latest.priority}
            </div>
          ) : null}
          {latest.nextMilestone ? (
            <div className="mt-2 text-[11px] text-muted-foreground">
              → Next milestone: <span className="text-foreground">{latest.nextMilestone}</span>
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-border bg-card lg:col-span-2">
          <div className="border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">{latest.metricName} over time</div>
            <div className="text-[11px] text-muted-foreground">All logged updates.</div>
          </div>
          <div className="p-2">
            <VentureChart data={chartData} />
          </div>
        </div>
      </div>

      {blockers.length > 0 ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" />
            Blockers
          </div>
          <ul className="space-y-1.5 text-sm">
            {blockers.map((b) => (
              <li key={b.id} className="flex items-baseline justify-between gap-3">
                <span>{b.blocker}</span>
                <span className="shrink-0 text-[11px] text-muted-foreground">{formatDate(b.date)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-semibold">Update history</div>
          <VentureDialog />
        </div>
        <ul className="divide-y divide-border">
          {updates.map((u) => (
            <li key={u.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center">
              <div className="flex items-center gap-3 md:w-48">
                <Badge variant="outline">{u.ventureName}</Badge>
                <span className="text-[11px] text-muted-foreground">{formatDate(u.date)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold tabular-nums">
                    {formatNumber(u.metricValue, { compact: true })}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{u.metricName}</span>
                </div>
                {u.priority ? (
                  <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{u.priority}</div>
                ) : null}
                {u.blocker ? (
                  <div className="mt-0.5 truncate text-[11px] text-destructive">⚠ {u.blocker}</div>
                ) : null}
              </div>
              <div className="flex items-center gap-1">
                <VentureDialog update={u} />
                <VentureDelete id={u.id} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
