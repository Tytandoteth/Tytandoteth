"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { checkinSchema, type CheckinInput } from "@/lib/validations";
import { upsertDailyCheckin } from "@/lib/actions/review";

type Checkin = {
  date: Date;
  topPriority1: string | null;
  topPriority2: string | null;
  topPriority3: string | null;
  workoutPlanned: boolean;
  energyLevel: number | null;
  stressLevel: number | null;
  notes: string | null;
} | null;

export function CheckinForm({ existing }: { existing: Checkin }) {
  const [isPending, startTransition] = useTransition();
  const today = new Date().toISOString().slice(0, 10);

  const form = useForm<CheckinInput>({
    resolver: zodResolver(checkinSchema),
    defaultValues: existing
      ? {
          date: existing.date.toISOString().slice(0, 10),
          topPriority1: existing.topPriority1 ?? "",
          topPriority2: existing.topPriority2 ?? "",
          topPriority3: existing.topPriority3 ?? "",
          workoutPlanned: existing.workoutPlanned,
          energyLevel: existing.energyLevel ?? undefined,
          stressLevel: existing.stressLevel ?? undefined,
          notes: existing.notes ?? "",
        }
      : {
          date: today,
          topPriority1: "",
          topPriority2: "",
          topPriority3: "",
          workoutPlanned: false,
          notes: "",
        },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) =>
        startTransition(async () => {
          try {
            await upsertDailyCheckin(data);
            toast.success("Check-in saved");
          } catch {
            toast.error("Couldn't save");
          }
        }),
      )}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Date</Label>
          <Input type="date" {...form.register("date")} />
        </div>
        <label className="flex cursor-pointer items-center gap-2 self-end rounded-md border border-border bg-background/40 px-3 py-2 text-sm">
          <input type="checkbox" {...form.register("workoutPlanned")} />
          Workout planned today
        </label>
      </div>

      <div className="space-y-2">
        <Label>Top 3 priorities</Label>
        <div className="space-y-2">
          {(["topPriority1", "topPriority2", "topPriority3"] as const).map((k, i) => (
            <div key={k} className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background/40 text-sm font-semibold">
                {i + 1}
              </div>
              <Input placeholder={`Priority ${i + 1}`} {...form.register(k)} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Energy (1-5)</Label>
          <Input type="number" min={1} max={5} {...form.register("energyLevel")} />
        </div>
        <div>
          <Label>Stress (1-5)</Label>
          <Input type="number" min={1} max={5} {...form.register("stressLevel")} />
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea rows={3} placeholder="One line about yesterday, one about today." {...form.register("notes")} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="h-3.5 w-3.5" />
          Save check-in
        </Button>
      </div>
    </form>
  );
}
