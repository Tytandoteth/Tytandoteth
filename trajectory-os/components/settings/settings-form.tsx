"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { settingsSchema, type SettingsInput } from "@/lib/validations";
import { updateSettings } from "@/lib/actions/settings";

type User = {
  monthlyBurnTarget: number;
  savingsTarget: number;
  liquidCashStart: number;
  weightJobs: number;
  weightFitness: number;
  weightContent: number;
  weightFinance: number;
  weightVenture: number;
};

export function SettingsForm({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();
  const { resolvedTheme, setTheme } = useTheme();
  const [themeLabel, setThemeLabel] = useState(resolvedTheme ?? "dark");

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      monthlyBurnTarget: user.monthlyBurnTarget,
      savingsTarget: user.savingsTarget,
      liquidCashStart: user.liquidCashStart,
      weightJobs: user.weightJobs,
      weightFitness: user.weightFitness,
      weightContent: user.weightContent,
      weightFinance: user.weightFinance,
      weightVenture: user.weightVenture,
    },
  });

  const weights = form.watch(["weightJobs", "weightFitness", "weightContent", "weightFinance", "weightVenture"]);
  const weightTotal = weights.reduce((a, b) => a + Number(b || 0), 0);

  return (
    <form
      onSubmit={form.handleSubmit((data) =>
        startTransition(async () => {
          try {
            await updateSettings(data);
            toast.success("Settings saved");
          } catch {
            toast.error("Couldn't save");
          }
        }),
      )}
      className="space-y-6"
    >
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4">
          <div className="text-sm font-semibold">Finance defaults</div>
          <div className="text-[11px] text-muted-foreground">Used for runway math, targets, and dashboard hints.</div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <Label>Monthly burn target ($)</Label>
            <Input type="number" {...form.register("monthlyBurnTarget")} />
          </div>
          <div>
            <Label>Savings target ($)</Label>
            <Input type="number" {...form.register("savingsTarget")} />
          </div>
          <div>
            <Label>Opening liquid cash ($)</Label>
            <Input type="number" {...form.register("liquidCashStart")} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Weekly score weights</div>
            <div className="text-[11px] text-muted-foreground">
              Allocate 100 points across the 5 categories. The dashboard uses these weights.
            </div>
          </div>
          <Badge variant={weightTotal === 100 ? "success" : "warning"}>
            Total: {weightTotal}/100
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div>
            <Label>Jobs</Label>
            <Input type="number" min={0} max={100} {...form.register("weightJobs")} />
          </div>
          <div>
            <Label>Fitness</Label>
            <Input type="number" min={0} max={100} {...form.register("weightFitness")} />
          </div>
          <div>
            <Label>Content</Label>
            <Input type="number" min={0} max={100} {...form.register("weightContent")} />
          </div>
          <div>
            <Label>Finance</Label>
            <Input type="number" min={0} max={100} {...form.register("weightFinance")} />
          </div>
          <div>
            <Label>Venture</Label>
            <Input type="number" min={0} max={100} {...form.register("weightVenture")} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4">
          <div className="text-sm font-semibold">Appearance</div>
          <div className="text-[11px] text-muted-foreground">Dark is the default. Light is available.</div>
        </div>
        <div className="flex gap-2">
          {(["dark", "light", "system"] as const).map((t) => (
            <Button
              key={t}
              type="button"
              variant={themeLabel === t ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setTheme(t);
                setThemeLabel(t);
              }}
            >
              {t}
            </Button>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="h-3.5 w-3.5" />
          Save settings
        </Button>
      </div>
    </form>
  );
}
