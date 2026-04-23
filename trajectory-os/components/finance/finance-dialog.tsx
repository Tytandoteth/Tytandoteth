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
import { financeSchema, type FinanceInput } from "@/lib/validations";
import { createFinance, updateFinance } from "@/lib/actions/finance";

type FinanceRow = {
  id: string;
  date: Date;
  type: string;
  category: string;
  amount: number;
  notes: string | null;
};

export function FinanceDialog({ entry }: { entry?: FinanceRow }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const editing = !!entry;

  const form = useForm<FinanceInput>({
    resolver: zodResolver(financeSchema),
    defaultValues: entry
      ? {
          date: entry.date.toISOString().slice(0, 10),
          type: entry.type as any,
          category: entry.category,
          amount: entry.amount,
          notes: entry.notes ?? "",
        }
      : {
          date: new Date().toISOString().slice(0, 10),
          type: "expense",
          category: "",
          amount: 0,
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
            Add entry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit entry" : "New entry"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) =>
            startTransition(async () => {
              try {
                if (editing && entry) await updateFinance(entry.id, data);
                else await createFinance(data);
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
              <Label>Type</Label>
              <Select value={form.watch("type")} onValueChange={(v) => form.setValue("type", v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Input placeholder="Rent, Software, Freelance…" {...form.register("category")} />
            </div>
            <div>
              <Label>Amount ($)</Label>
              <Input type="number" step="0.01" {...form.register("amount")} />
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
