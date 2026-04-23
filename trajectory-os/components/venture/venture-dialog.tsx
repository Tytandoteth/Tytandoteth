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
import { ventureSchema, type VentureInput } from "@/lib/validations";
import { createVentureUpdate, updateVentureUpdate } from "@/lib/actions/venture";

type VentureRow = {
  id: string;
  date: Date;
  ventureName: string;
  metricName: string;
  metricValue: number;
  priority: string | null;
  blocker: string | null;
  nextMilestone: string | null;
  notes: string | null;
};

export function VentureDialog({ update }: { update?: VentureRow }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const editing = !!update;

  const form = useForm<VentureInput>({
    resolver: zodResolver(ventureSchema),
    defaultValues: update
      ? {
          date: update.date.toISOString().slice(0, 10),
          ventureName: update.ventureName,
          metricName: update.metricName,
          metricValue: update.metricValue,
          priority: update.priority ?? "",
          blocker: update.blocker ?? "",
          nextMilestone: update.nextMilestone ?? "",
          notes: update.notes ?? "",
        }
      : {
          date: new Date().toISOString().slice(0, 10),
          ventureName: "Trajectory OS",
          metricName: "Waitlist signups",
          metricValue: 0,
          priority: "",
          blocker: "",
          nextMilestone: "",
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
            New update
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit venture update" : "New venture update"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) =>
            startTransition(async () => {
              try {
                if (editing && update) await updateVentureUpdate(update.id, data);
                else await createVentureUpdate(data);
                toast.success(editing ? "Updated" : "Added");
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
              <Label>Venture</Label>
              <Input {...form.register("ventureName")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Metric name</Label>
              <Input placeholder="Waitlist, MRR, Users…" {...form.register("metricName")} />
            </div>
            <div>
              <Label>Metric value</Label>
              <Input type="number" step="any" {...form.register("metricValue")} />
            </div>
          </div>
          <div>
            <Label>Priority this week</Label>
            <Textarea rows={2} {...form.register("priority")} />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label>Blocker</Label>
              <Input {...form.register("blocker")} />
            </div>
            <div>
              <Label>Next milestone</Label>
              <Input {...form.register("nextMilestone")} />
            </div>
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
              {editing ? "Save" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
