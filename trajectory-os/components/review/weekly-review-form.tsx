"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { weeklyReviewSchema, type WeeklyReviewInput } from "@/lib/validations";
import { upsertWeeklyReview } from "@/lib/actions/review";
import type { WeeklyScore } from "@/lib/score";
import { cn } from "@/lib/utils";

type Review = {
  weekStart: Date;
  wins: string | null;
  losses: string | null;
  lessons: string | null;
  nextWeekFocus: string | null;
  totalScore: number;
} | null;

const LABELS: Record<string, string> = {
  jobs: "Jobs",
  fitness: "Fitness",
  content: "Content",
  finance: "Finance",
  venture: "Venture",
};

export function WeeklyReviewForm({
  existing,
  weekStart,
  score,
}: {
  existing: Review;
  weekStart: string;
  score: WeeklyScore;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<WeeklyReviewInput>({
    resolver: zodResolver(weeklyReviewSchema),
    defaultValues: existing
      ? {
          weekStart,
          wins: existing.wins ?? "",
          losses: existing.losses ?? "",
          lessons: existing.lessons ?? "",
          nextWeekFocus: existing.nextWeekFocus ?? "",
        }
      : {
          weekStart,
          wins: "",
          losses: "",
          lessons: "",
          nextWeekFocus: "",
        },
  });

  const tone = score.total >= 80 ? "success" : score.total >= 50 ? "warning" : "destructive";

  return (
    <form
      onSubmit={form.handleSubmit((data) =>
        startTransition(async () => {
          try {
            await upsertWeeklyReview(data);
            toast.success("Weekly review saved");
          } catch {
            toast.error("Couldn't save");
          }
        }),
      )}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 md:col-span-1">
          <div className="stat-label">Auto-calculated score</div>
          <div
            className={cn(
              "mt-1 flex items-baseline gap-1.5 text-3xl font-semibold tabular-nums",
              tone === "success" && "text-[hsl(var(--success))]",
              tone === "warning" && "text-[hsl(var(--warning))]",
              tone === "destructive" && "text-destructive",
            )}
          >
            {score.total}
            <span className="text-sm font-normal text-muted-foreground">/ {score.max}</span>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-1.5 text-center">
            {score.breakdowns.map((b) => (
              <div key={b.category} className="rounded-md border border-border bg-background/40 p-1.5">
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  {LABELS[b.category]}
                </div>
                <div className="text-sm font-semibold tabular-nums">{b.earned}</div>
                <div className="text-[9px] text-muted-foreground">/ {b.weight}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Score is derived from weekly commitment completion. Saving persists the snapshot.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:col-span-2">
          <div>
            <Label>Wins</Label>
            <Textarea rows={3} {...form.register("wins")} placeholder="What actually worked?" />
          </div>
          <div>
            <Label>Losses</Label>
            <Textarea rows={3} {...form.register("losses")} placeholder="What slipped?" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Lessons</Label>
          <Textarea rows={3} {...form.register("lessons")} placeholder="What did you learn this week?" />
        </div>
        <div>
          <Label>Next week focus</Label>
          <Textarea rows={3} {...form.register("nextWeekFocus")} placeholder="1-3 things that matter next week." />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="h-3.5 w-3.5" />
          Save weekly review
        </Button>
      </div>
    </form>
  );
}
