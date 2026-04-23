"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { JobDialog } from "@/components/jobs/job-dialog";
import { JOB_STAGES_ORDER, JOB_STAGE_LABELS } from "@/lib/validations";
import { updateJobStage, deleteJobLead } from "@/lib/actions/jobs";
import { formatRelative } from "@/lib/utils";
import { Briefcase } from "lucide-react";

type Lead = {
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

export function JobsView({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No leads yet"
        description="Start a pipeline. Cold, warm, referrals — track them all."
        action={<JobDialog />}
      />
    );
  }

  const followUps = leads.filter(
    (l) =>
      l.followUpDate &&
      l.followUpDate.getTime() <= Date.now() + 3 * 86400000 &&
      !["offer", "rejected", "archived"].includes(l.stage),
  );
  const highUpside = [...leads]
    .filter((l) => l.stage !== "rejected" && l.stage !== "archived")
    .sort(
      (a, b) =>
        (b.probability ?? 0) * (stageWeight(b.stage) + 1) -
        (a.probability ?? 0) * (stageWeight(a.stage) + 1),
    )
    .slice(0, 5);

  return (
    <Tabs defaultValue="kanban">
      <div className="mb-3 flex items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="followups">
            Follow-ups {followUps.length ? <span className="ml-1 text-foreground">{followUps.length}</span> : null}
          </TabsTrigger>
          <TabsTrigger value="upside">High upside</TabsTrigger>
        </TabsList>
        <JobDialog />
      </div>

      <TabsContent value="kanban">
        <KanbanView leads={leads} />
      </TabsContent>
      <TabsContent value="table">
        <TableView leads={leads} />
      </TabsContent>
      <TabsContent value="followups">
        <TableView leads={followUps} emptyMsg="No follow-ups due. Nice." />
      </TabsContent>
      <TabsContent value="upside">
        <TableView leads={highUpside} emptyMsg="No high-upside targets yet." />
      </TabsContent>
    </Tabs>
  );
}

function stageWeight(stage: string) {
  const idx = JOB_STAGES_ORDER.indexOf(stage as any);
  return idx < 0 ? 0 : idx;
}

function KanbanView({ leads }: { leads: Lead[] }) {
  const grouped = useMemo(
    () =>
      JOB_STAGES_ORDER.filter((s) => s !== "archived").map((stage) => ({
        stage,
        items: leads.filter((l) => l.stage === stage),
      })),
    [leads],
  );

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {grouped.map((col) => (
        <div key={col.stage} className="w-72 shrink-0 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {JOB_STAGE_LABELS[col.stage]}
            </div>
            <Badge variant="muted">{col.items.length}</Badge>
          </div>
          <ul className="space-y-2 p-2">
            {col.items.map((lead) => (
              <KanbanCard key={lead.id} lead={lead} />
            ))}
            {col.items.length === 0 ? (
              <li className="rounded-md border border-dashed border-border/60 p-3 text-center text-[11px] text-muted-foreground">
                —
              </li>
            ) : null}
          </ul>
        </div>
      ))}
    </div>
  );
}

function KanbanCard({ lead }: { lead: Lead }) {
  const [isPending, startTransition] = useTransition();
  return (
    <li className="rounded-md border border-border bg-background/60 p-3 transition-colors hover:border-foreground/30">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{lead.company}</div>
          <div className="truncate text-xs text-muted-foreground">{lead.role}</div>
        </div>
        <JobDialog lead={lead} />
      </div>
      {lead.compensationEstimate ? (
        <div className="mt-1.5 text-[11px] text-muted-foreground">{lead.compensationEstimate}</div>
      ) : null}
      {lead.nextAction ? (
        <div className="mt-2 text-[11px]">
          <span className="text-muted-foreground">Next: </span>
          {lead.nextAction}
        </div>
      ) : null}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          {lead.followUpDate ? <span>↻ {formatRelative(lead.followUpDate)}</span> : null}
          {lead.probability !== null && lead.probability !== undefined ? (
            <span>{lead.probability}%</span>
          ) : null}
        </div>
        <Select
          value={lead.stage}
          onValueChange={(v) =>
            startTransition(async () => {
              await updateJobStage(lead.id, v);
              toast.success(`Moved to ${JOB_STAGE_LABELS[v as keyof typeof JOB_STAGE_LABELS]}`);
            })
          }
        >
          <SelectTrigger className="h-6 w-28 text-[11px]">
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
    </li>
  );
}

function TableView({ leads, emptyMsg }: { leads: Lead[]; emptyMsg?: string }) {
  const [sortBy, setSortBy] = useState<"company" | "stage" | "followUp" | "probability">("followUp");
  const [isPending, startTransition] = useTransition();

  const sorted = useMemo(() => {
    const list = [...leads];
    list.sort((a, b) => {
      switch (sortBy) {
        case "company":
          return a.company.localeCompare(b.company);
        case "stage":
          return JOB_STAGES_ORDER.indexOf(a.stage as any) - JOB_STAGES_ORDER.indexOf(b.stage as any);
        case "followUp":
          return (a.followUpDate?.getTime() ?? Infinity) - (b.followUpDate?.getTime() ?? Infinity);
        case "probability":
          return (b.probability ?? 0) - (a.probability ?? 0);
      }
    });
    return list;
  }, [leads, sortBy]);

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {emptyMsg ?? "No leads."}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button onClick={() => setSortBy("company")} className="hover:text-foreground">
                Company
              </button>
            </TableHead>
            <TableHead>Role</TableHead>
            <TableHead>
              <button onClick={() => setSortBy("stage")} className="hover:text-foreground">
                Stage
              </button>
            </TableHead>
            <TableHead>Next action</TableHead>
            <TableHead>
              <button onClick={() => setSortBy("followUp")} className="hover:text-foreground">
                Follow-up
              </button>
            </TableHead>
            <TableHead>
              <button onClick={() => setSortBy("probability")} className="hover:text-foreground">
                Prob.
              </button>
            </TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {l.company}
                  {l.link ? (
                    <Link href={l.link} target="_blank" className="text-muted-foreground hover:text-foreground">
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : null}
                </div>
                {l.compensationEstimate ? (
                  <div className="text-[10px] text-muted-foreground">{l.compensationEstimate}</div>
                ) : null}
              </TableCell>
              <TableCell className="text-muted-foreground">{l.role}</TableCell>
              <TableCell>
                <Badge variant="outline">{JOB_STAGE_LABELS[l.stage as keyof typeof JOB_STAGE_LABELS]}</Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                {l.nextAction ?? "—"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {l.followUpDate ? formatRelative(l.followUpDate) : "—"}
              </TableCell>
              <TableCell className="tabular-nums text-xs text-muted-foreground">
                {l.probability ?? "—"}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <JobDialog lead={l} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={isPending}
                    onClick={() => {
                      if (confirm(`Delete ${l.company}?`))
                        startTransition(async () => {
                          await deleteJobLead(l.id);
                          toast.success("Deleted");
                        });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
