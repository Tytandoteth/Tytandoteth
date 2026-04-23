"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { workoutSchema, type WorkoutInput } from "@/lib/validations";
import { createWorkout, updateWorkout } from "@/lib/actions/workouts";

type Workout = {
  id: string;
  date: Date;
  workoutType: string;
  durationMin: number;
  completed: boolean;
  bodyweight: number | null;
  proteinHit: boolean;
  creatineTaken: boolean;
  notes: string | null;
};

export function WorkoutDialog({ workout }: { workout?: Workout }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const editing = !!workout;

  const form = useForm<WorkoutInput>({
    resolver: zodResolver(workoutSchema),
    defaultValues: workout
      ? {
          date: workout.date.toISOString().slice(0, 10),
          workoutType: workout.workoutType,
          durationMin: workout.durationMin,
          completed: workout.completed,
          bodyweight: workout.bodyweight ?? undefined,
          proteinHit: workout.proteinHit,
          creatineTaken: workout.creatineTaken,
          notes: workout.notes ?? "",
        }
      : {
          date: new Date().toISOString().slice(0, 10),
          workoutType: "Lift — Push",
          durationMin: 55,
          completed: true,
          proteinHit: false,
          creatineTaken: false,
          notes: "",
        },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editing ? (
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Log workout
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit workout" : "Log workout"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) =>
            startTransition(async () => {
              try {
                if (editing && workout) await updateWorkout(workout.id, data);
                else await createWorkout(data);
                toast.success(editing ? "Workout updated" : "Workout logged");
                setOpen(false);
              } catch {
                toast.error("Couldn't save");
              }
            }),
          )}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" {...form.register("date")} />
            </div>
            <div>
              <Label>Type</Label>
              <Input {...form.register("workoutType")} placeholder="Lift — Push / Run / Yoga" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Duration (min)</Label>
              <Input type="number" {...form.register("durationMin")} />
            </div>
            <div>
              <Label>Bodyweight (lb)</Label>
              <Input type="number" step="0.1" {...form.register("bodyweight")} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <label className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs">
              <input type="checkbox" {...form.register("completed")} /> Completed
            </label>
            <label className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs">
              <input type="checkbox" {...form.register("proteinHit")} /> Protein
            </label>
            <label className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs">
              <input type="checkbox" {...form.register("creatineTaken")} /> Creatine
            </label>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={2} {...form.register("notes")} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {editing ? "Save" : "Log"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
