import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Action = { kind: string; text: string; href: string };

const KIND_LABEL: Record<string, string> = {
  jobs: "Jobs",
  content: "Content",
  fitness: "Fitness",
  finance: "Finance",
  venture: "Venture",
  review: "Review",
};

export function NextActions({ actions }: { actions: Action[] }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="text-sm font-semibold">Next best actions</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Today</div>
      </div>
      <ul className="divide-y divide-border">
        {actions.map((a, i) => (
          <li key={i}>
            <Link
              href={a.href}
              className="group flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/40"
            >
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[10px]">
                  {KIND_LABEL[a.kind] ?? a.kind}
                </Badge>
                <span className="text-foreground">{a.text}</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
