import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "destructive";
  className?: string;
}) {
  const toneClass =
    tone === "success"
      ? "text-[hsl(var(--success))]"
      : tone === "warning"
        ? "text-[hsl(var(--warning))]"
        : tone === "destructive"
          ? "text-destructive"
          : "";

  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/15",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="stat-label">{label}</span>
        {Icon ? <Icon className="h-3.5 w-3.5 text-muted-foreground" /> : null}
      </div>
      <div className={cn("stat-value", toneClass)}>{value}</div>
      {hint ? <div className="text-[11px] text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
