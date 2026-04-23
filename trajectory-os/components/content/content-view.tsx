"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import {
  contentSchema,
  CONTENT_STATUS_LABELS,
  CONTENT_STATUSES_ORDER,
  type ContentInput,
} from "@/lib/validations";
import { createContent, updateContent, updateContentStatus, deleteContent } from "@/lib/actions/content";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

type ContentItem = {
  id: string;
  title: string;
  platform: string;
  format: string;
  status: string;
  hook: string | null;
  cta: string | null;
  publishDate: Date | null;
  notes: string | null;
};

export function ContentView({ items }: { items: ContentItem[] }) {
  const backlog = items.filter((i) => ["idea", "drafted", "recorded", "edited"].includes(i.status));
  const posted = items.filter((i) => ["posted", "repurposed"].includes(i.status));
  const upcoming = items
    .filter((i) => i.publishDate && i.status !== "posted")
    .sort((a, b) => (a.publishDate!.getTime() - b.publishDate!.getTime()));

  if (items.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No content yet"
        description="Start with ideas. Ship early, iterate on the hook."
        action={<ContentDialog />}
      />
    );
  }

  return (
    <Tabs defaultValue="board">
      <div className="mb-3 flex items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="board">Status board</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="posted">Posted</TabsTrigger>
        </TabsList>
        <ContentDialog />
      </div>
      <TabsContent value="board">
        <StatusBoard items={items} />
      </TabsContent>
      <TabsContent value="backlog">
        <ItemList items={backlog} emptyMsg="Backlog empty. Nice." />
      </TabsContent>
      <TabsContent value="calendar">
        <ItemList items={upcoming} showDate emptyMsg="No publish dates set." />
      </TabsContent>
      <TabsContent value="posted">
        <ItemList items={posted} showDate emptyMsg="Nothing posted yet." />
      </TabsContent>
    </Tabs>
  );
}

function StatusBoard({ items }: { items: ContentItem[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {CONTENT_STATUSES_ORDER.map((status) => {
        const cards = items.filter((i) => i.status === status);
        return (
          <div key={status} className="w-72 shrink-0 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {CONTENT_STATUS_LABELS[status]}
              </div>
              <Badge variant="muted">{cards.length}</Badge>
            </div>
            <ul className="space-y-2 p-2">
              {cards.map((c) => (
                <ContentCard key={c.id} item={c} />
              ))}
              {cards.length === 0 ? (
                <li className="rounded-md border border-dashed border-border/60 p-3 text-center text-[11px] text-muted-foreground">
                  —
                </li>
              ) : null}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function ContentCard({ item }: { item: ContentItem }) {
  const [isPending, startTransition] = useTransition();
  const nextStatus = nextStatusOf(item.status);
  return (
    <li className="rounded-md border border-border bg-background/60 p-3 transition-colors hover:border-foreground/30">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{item.title}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>{item.platform}</span>
            <span>·</span>
            <span>{item.format}</span>
          </div>
        </div>
        <ContentDialog item={item} />
      </div>
      {item.hook ? (
        <div className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">"{item.hook}"</div>
      ) : null}
      {nextStatus ? (
        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={() =>
              startTransition(async () => {
                await updateContentStatus(item.id, nextStatus);
                toast.success(`→ ${CONTENT_STATUS_LABELS[nextStatus as keyof typeof CONTENT_STATUS_LABELS]}`);
              })
            }
            disabled={isPending}
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
          >
            Move to {CONTENT_STATUS_LABELS[nextStatus as keyof typeof CONTENT_STATUS_LABELS]}
            <ArrowRight className="h-3 w-3" />
          </button>
          {item.publishDate ? (
            <span className="text-[10px] text-muted-foreground">{formatDate(item.publishDate)}</span>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function nextStatusOf(status: string): string | null {
  const idx = CONTENT_STATUSES_ORDER.indexOf(status as any);
  if (idx === -1 || idx >= CONTENT_STATUSES_ORDER.length - 1) return null;
  return CONTENT_STATUSES_ORDER[idx + 1];
}

function ItemList({
  items,
  showDate,
  emptyMsg,
}: {
  items: ContentItem[];
  showDate?: boolean;
  emptyMsg?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {emptyMsg ?? "Nothing here."}
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-card">
      <ul className="divide-y divide-border">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {i.platform}
                </Badge>
                <Badge variant="muted" className="capitalize">
                  {CONTENT_STATUS_LABELS[i.status as keyof typeof CONTENT_STATUS_LABELS]}
                </Badge>
                <div className="truncate text-sm font-medium">{i.title}</div>
              </div>
              {i.hook ? (
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">"{i.hook}"</div>
              ) : null}
            </div>
            {showDate ? (
              <div className="shrink-0 text-xs text-muted-foreground">
                {i.publishDate ? formatDate(i.publishDate) : "—"}
              </div>
            ) : null}
            <div className="flex items-center gap-1">
              <ContentDialog item={i} />
              <DeleteButton id={i.id} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete?"))
          startTransition(async () => {
            await deleteContent(id);
            toast.success("Deleted");
          });
      }}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

function ContentDialog({ item }: { item?: ContentItem }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const editing = !!item;
  const form = useForm<ContentInput>({
    resolver: zodResolver(contentSchema),
    defaultValues: item
      ? {
          title: item.title,
          platform: item.platform as any,
          format: item.format as any,
          status: item.status as any,
          hook: item.hook ?? "",
          cta: item.cta ?? "",
          publishDate: item.publishDate ? item.publishDate.toISOString().slice(0, 10) : "",
          notes: item.notes ?? "",
        }
      : {
          title: "",
          platform: "twitter",
          format: "post",
          status: "idea",
          hook: "",
          cta: "",
          publishDate: "",
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
            New content
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit content" : "New content"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) =>
            startTransition(async () => {
              try {
                if (editing && item) await updateContent(item.id, data);
                else await createContent(data);
                toast.success(editing ? "Updated" : "Added");
                setOpen(false);
              } catch {
                toast.error("Couldn't save");
              }
            }),
          )}
          className="space-y-3"
        >
          <div>
            <Label>Title</Label>
            <Input {...form.register("title")} autoFocus />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Platform</Label>
              <Select value={form.watch("platform")} onValueChange={(v) => form.setValue("platform", v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["twitter", "linkedin", "youtube", "blog", "tiktok", "newsletter"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Format</Label>
              <Select value={form.watch("format")} onValueChange={(v) => form.setValue("format", v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["post", "thread", "video", "article", "short", "newsletter"].map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_STATUSES_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {CONTENT_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Hook</Label>
            <Textarea rows={2} {...form.register("hook")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>CTA</Label>
              <Input {...form.register("cta")} />
            </div>
            <div>
              <Label>Publish date</Label>
              <Input type="date" {...form.register("publishDate")} />
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
