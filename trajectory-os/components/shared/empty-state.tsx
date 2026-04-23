import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/40 px-6 py-10 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      ) : null}
      <div className="text-sm font-medium">{title}</div>
      {description ? <p className="max-w-sm text-xs text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
