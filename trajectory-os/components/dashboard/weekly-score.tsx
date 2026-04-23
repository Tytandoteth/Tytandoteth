import { Progress } from "@/components/ui/progress";
import type { WeeklyScore } from "@/lib/score";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  jobs: "Jobs",
  fitness: "Fitness",
  content: "Content",
  finance: "Finance",
  venture: "Venture",
};

export function WeeklyScoreCard({ score }: { score: WeeklyScore }) {
  const tone = score.total >= 80 ? "success" : score.total >= 50 ? "warning" : "destructive";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="stat-label">Weekly score</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={cn(
                "text-3xl font-semibold tabular-nums tracking-tight",
                tone === "success" && "text-[hsl(var(--success))]",
                tone === "warning" && "text-[hsl(var(--warning))]",
                tone === "destructive" && "text-destructive",
              )}
            >
              {score.total}
            </span>
            <span className="text-sm text-muted-foreground">/ {score.max}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {score.breakdowns.map((b) => (
          <div key={b.category}>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{LABELS[b.category]}</span>
              <span className="tabular-nums text-foreground">
                {b.earned}/{b.weight} · {b.completed}/{b.target || 0}
              </span>
            </div>
            <Progress value={(b.earned / Math.max(1, b.weight)) * 100} />
          </div>
        ))}
      </div>
    </div>
  );
}
