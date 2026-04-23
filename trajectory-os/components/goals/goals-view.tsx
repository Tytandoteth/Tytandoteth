"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Minus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  goalSchema,
  commitmentSchema,
  type GoalInput,
  type CommitmentInput,
} from "@/lib/validations";
import {
  createGoal,
  updateGoal,
  deleteGoal,
  createCommitment,
  incrementCommitment,
  deleteCommitment,
} from "@/lib/actions/goals";
import { Target } from "lucide-react";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  timeframe: string;
  targetValue: number | null;
  currentValue: number | null;
  unit: string | null;
  dueDate: Date | null;
  status: string;
};

type Commitment = {
  id: string;
  category: string;
  title: string;
  target: number;
  completed: number;
};

export function GoalsView({
  northStar,
  ninetyDay,
  commitments,
}: {
  northStar: Goal[];
  ninetyDay: Goal[];
  commitments: Commitment[];
}) {
  return (
    <div className="space-y-8">
      <section>
        <SectionHeader title="North star" description="3-5 year destination. Where you're headed." />
        <GoalList goals={northStar} defaultTimeframe="north_star" />
      </section>

      <section>
        <SectionHeader title="90-day goals" description="Current quarter. Your actual delivery window." />
        <GoalList goals={ninetyDay} defaultTimeframe="ninety_day" />
      </section>

      <section>
        <SectionHeader title="This week's commitments" description="The small promises that compound into goals." />
        <CommitmentList commitments={commitments} />
      </section>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function GoalList({
  goals,
  defaultTimeframe,
}: {
  goals: Goal[];
  defaultTimeframe: "north_star" | "ninety_day";
}) {
  return (
    <div className="rounded-lg border border-border bg-card">
      {goals.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={Target}
            title="No goals here yet"
            description="Keep it short — 2-3 at most."
            action={<GoalDialog defaultTimeframe={defaultTimeframe} />}
          />
        </div>
      ) : (
        <>
          <ul className="divide-y divide-border">
            {goals.map((g) => (
              <GoalRow key={g.id} goal={g} />
            ))}
          </ul>
          <div className="flex items-center justify-end border-t border-border p-2">
            <GoalDialog defaultTimeframe={defaultTimeframe} />
          </div>
        </>
      )}
    </div>
  );
}

function GoalRow({ goal }: { goal: Goal }) {
  const [isPending, startTransition] = useTransition();
  const pct =
    goal.targetValue && goal.targetValue > 0 && goal.currentValue !== null
      ? Math.min(100, Math.max(0, (goal.currentValue / goal.targetValue) * 100))
      : 0;
  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {goal.category}
          </Badge>
          <div className="text-sm font-medium">{goal.title}</div>
          {goal.status !== "active" ? (
            <Badge variant="muted" className="capitalize">
              {goal.status}
            </Badge>
          ) : null}
        </div>
        {goal.description ? (
          <div className="mt-0.5 text-[11px] text-muted-foreground">{goal.description}</div>
        ) : null}
      </div>
      <div className="flex items-center gap-3 sm:w-80">
        <Progress value={pct} className="flex-1" />
        <div className="w-20 text-right text-[11px] tabular-nums text-muted-foreground">
          {goal.currentValue ?? 0}/{goal.targetValue ?? "—"} {goal.unit ?? ""}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <GoalDialog goal={goal} defaultTimeframe={goal.timeframe as any} />
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              if (confirm(`Delete goal "${goal.title}"?`)) {
                await deleteGoal(goal.id);
                toast.success("Goal deleted");
              }
            })
          }
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  );
}

function GoalDialog({
  goal,
  defaultTimeframe,
}: {
  goal?: Goal;
  defaultTimeframe: "north_star" | "ninety_day" | "weekly";
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const editing = !!goal;

  const form = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: goal
      ? {
          title: goal.title,
          description: goal.description ?? "",
          category: goal.category as any,
          timeframe: goal.timeframe as any,
          targetValue: goal.targetValue ?? undefined,
          currentValue: goal.currentValue ?? undefined,
          unit: goal.unit ?? "",
          dueDate: goal.dueDate ? goal.dueDate.toISOString().slice(0, 10) : "",
          status: goal.status as any,
        }
      : {
          title: "",
          description: "",
          category: "other",
          timeframe: defaultTimeframe,
          unit: "",
          dueDate: "",
          status: "active",
        },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editing ? (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            New goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit goal" : "New goal"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) =>
            startTransition(async () => {
              try {
                if (editing && goal) await updateGoal(goal.id, data);
                else await createGoal(data);
                toast.success(editing ? "Goal updated" : "Goal created");
                setOpen(false);
              } catch (e) {
                toast.error("Something went wrong");
              }
            }),
          )}
          className="space-y-3"
        >
          <div>
            <Label htmlFor="g-title">Title</Label>
            <Input id="g-title" {...form.register("title")} autoFocus />
          </div>
          <div>
            <Label htmlFor="g-desc">Description</Label>
            <Textarea id="g-desc" rows={2} {...form.register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(v) => form.setValue("category", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["wealth", "fitness", "job", "content", "venture", "other"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Timeframe</Label>
              <Select
                value={form.watch("timeframe")}
                onValueChange={(v) => form.setValue("timeframe", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="north_star">North star</SelectItem>
                  <SelectItem value="ninety_day">90-day</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Target</Label>
              <Input type="number" step="any" {...form.register("targetValue")} />
            </div>
            <div>
              <Label>Current</Label>
              <Input type="number" step="any" {...form.register("currentValue")} />
            </div>
            <div>
              <Label>Unit</Label>
              <Input placeholder="posts, mo, $" {...form.register("unit")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Due date</Label>
              <Input type="date" {...form.register("dueDate")} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["active", "paused", "done", "dropped"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {editing ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CommitmentList({ commitments }: { commitments: Commitment[] }) {
  const grouped = commitments.reduce<Record<string, Commitment[]>>((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});
  const cats: { key: string; label: string }[] = [
    { key: "jobs", label: "Jobs" },
    { key: "fitness", label: "Fitness" },
    { key: "content", label: "Content" },
    { key: "finance", label: "Finance" },
    { key: "venture", label: "Venture" },
  ];

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-end border-b border-border p-2">
        <CommitmentDialog />
      </div>
      {commitments.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={Target}
            title="No commitments yet this week"
            description="Keep them small and concrete. 1-2 per category."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-5 md:divide-x md:divide-y-0">
          {cats.map((cat) => (
            <div key={cat.key} className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {cat.label}
                </div>
              </div>
              <ul className="space-y-2">
                {(grouped[cat.key] ?? []).map((c) => (
                  <CommitmentRow key={c.id} commitment={c} />
                ))}
                {(grouped[cat.key] ?? []).length === 0 ? (
                  <li className="text-[11px] text-muted-foreground">—</li>
                ) : null}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CommitmentRow({ commitment }: { commitment: Commitment }) {
  const [isPending, startTransition] = useTransition();
  const pct = Math.min(100, (commitment.completed / commitment.target) * 100);
  return (
    <li className="rounded-md border border-border bg-background/40 p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1 truncate text-xs">{commitment.title}</div>
        <div className="text-[10px] tabular-nums text-muted-foreground">
          {commitment.completed}/{commitment.target}
        </div>
      </div>
      <Progress value={pct} className="mt-1.5 h-1" />
      <div className="mt-2 flex items-center justify-between gap-1">
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            disabled={isPending}
            onClick={() => startTransition(() => incrementCommitment(commitment.id, -1))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            disabled={isPending}
            onClick={() => startTransition(() => incrementCommitment(commitment.id, 1))}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <button
          onClick={() => {
            if (confirm("Delete?")) startTransition(() => deleteCommitment(commitment.id));
          }}
          className="text-[10px] text-muted-foreground hover:text-destructive"
        >
          Remove
        </button>
      </div>
    </li>
  );
}

function CommitmentDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<CommitmentInput>({
    resolver: zodResolver(commitmentSchema),
    defaultValues: { category: "jobs", title: "", target: 1, completed: 0 },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-3.5 w-3.5" />
          Add commitment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New weekly commitment</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) =>
            startTransition(async () => {
              try {
                await createCommitment(data);
                toast.success("Commitment added");
                setOpen(false);
                form.reset({ category: "jobs", title: "", target: 1, completed: 0 });
              } catch {
                toast.error("Couldn't save");
              }
            }),
          )}
          className="space-y-3"
        >
          <div>
            <Label>Title</Label>
            <Input {...form.register("title")} autoFocus placeholder="5 targeted applications" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Category</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(v) => form.setValue("category", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["jobs", "fitness", "content", "finance", "venture"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target</Label>
              <Input type="number" {...form.register("target")} />
            </div>
            <div>
              <Label>Completed</Label>
              <Input type="number" {...form.register("completed")} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
