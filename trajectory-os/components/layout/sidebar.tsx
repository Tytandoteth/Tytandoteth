"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Briefcase,
  Dumbbell,
  FileText,
  DollarSign,
  Rocket,
  NotebookPen,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, kbd: "1" },
  { href: "/goals", label: "Goals", icon: Target, kbd: "2" },
  { href: "/jobs", label: "Jobs", icon: Briefcase, kbd: "3" },
  { href: "/fitness", label: "Fitness", icon: Dumbbell, kbd: "4" },
  { href: "/content", label: "Content", icon: FileText, kbd: "5" },
  { href: "/finance", label: "Finance", icon: DollarSign, kbd: "6" },
  { href: "/venture", label: "Venture", icon: Rocket, kbd: "7" },
  { href: "/review", label: "Review", icon: NotebookPen, kbd: "8" },
  { href: "/settings", label: "Settings", icon: Settings, kbd: "9" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-56 shrink-0 border-r border-border bg-card/40 md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
          <span className="text-[11px] font-bold">T</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight">Trajectory OS</span>
          <span className="text-[10px] text-muted-foreground">operator dashboard</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" strokeWidth={active ? 2 : 1.75} />
                    {item.label}
                  </span>
                  <kbd
                    className={cn(
                      "hidden h-5 w-5 items-center justify-center rounded border border-border text-[10px] text-muted-foreground group-hover:flex",
                      active && "flex",
                    )}
                  >
                    {item.kbd}
                  </kbd>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <div className="rounded-md border border-dashed border-border/70 px-3 py-2 text-[11px] leading-tight text-muted-foreground">
          <div className="font-medium text-foreground">Where do I stand?</div>
          Single-operator build. No auth in MVP.
        </div>
      </div>
    </aside>
  );
}
