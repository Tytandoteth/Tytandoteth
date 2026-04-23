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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { jobLeadSchema, JOB_STAGE_LABELS, JOB_STAGES_ORDER, type JobLeadInput } from "@/lib/validations";
import { createJobLead, updateJobLead } from "@/lib/actions/jobs";

type JobLead = {
  id: string;
  company: string;
  role: string;
  source: string | null;
  location: string | null;
  compensationEstimate: string | null;
  stage: string;
  link: string | null;
  nextAction: string | null;
  followUpDate: Date | null;
  probability: number | null;
  notes: string | null;
};

export function JobDialog({ lead, trigger }: { lead?: JobLead; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const editing = !!lead;

  const form = useForm<JobLeadInput>({
    resolver: zodResolver(jobLeadSchema),
    defaultValues: lead
      ? {
          company: lead.company,
          role: lead.role,
          source: lead.source ?? "",
          location: lead.location ?? "",
          compensationEstimate: lead.compensationEstimate ?? "",
          stage: lead.stage as any,
          link: lead.link ?? "",
          nextAction: lead.nextAction ?? "",
          followUpDate: lead.followUpDate ? lead.followUpDate.toISOString().slice(0, 10) : "",
          probability: lead.probability ?? undefined,
          notes: lead.notes ?? "",
        }
      : {
          company: "",
          role: "",
          source: "",
          location: "",
          compensationEstimate: "",
          stage: "lead",
          link: "",
          nextAction: "",
          followUpDate: "",
          notes: "",
        },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          editing ? (
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              New lead
            </Button>
          )
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? `${lead!.company} — ${lead!.role}` : "New job lead"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) =>
            startTransition(async () => {
              try {
                if (editing && lead) await updateJobLead(lead.id, data);
                else await createJobLead(data);
                toast.success(editing ? "Lead updated" : "Lead added");
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
              <Label>Company</Label>
              <Input {...form.register("company")} autoFocus />
            </div>
            <div>
              <Label>Role</Label>
              <Input {...form.register("role")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Source</Label>
              <Input placeholder="Warm intro, cold, referral…" {...form.register("source")} />
            </div>
            <div>
              <Label>Location</Label>
              <Input placeholder="Remote / NYC…" {...form.register("location")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Comp estimate</Label>
              <Input placeholder="$180-220k + 0.5%" {...form.register("compensationEstimate")} />
            </div>
            <div>
              <Label>Link</Label>
              <Input placeholder="https://" {...form.register("link")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Stage</Label>
              <Select value={form.watch("stage")} onValueChange={(v) => form.setValue("stage", v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STAGES_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {JOB_STAGE_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Probability (%)</Label>
              <Input type="number" min={0} max={100} {...form.register("probability")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Next action</Label>
              <Input {...form.register("nextAction")} />
            </div>
            <div>
              <Label>Follow-up date</Label>
              <Input type="date" {...form.register("followUpDate")} />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={3} {...form.register("notes")} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {editing ? "Save" : "Add lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
