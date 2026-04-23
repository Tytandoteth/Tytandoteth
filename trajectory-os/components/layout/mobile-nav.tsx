"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/fitness", label: "Fitness", icon: Dumbbell },
  { href: "/content", label: "Content", icon: FileText },
  { href: "/finance", label: "Finance", icon: DollarSign },
  { href: "/venture", label: "Venture", icon: Rocket },
  { href: "/review", label: "Review", icon: NotebookPen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const pathname = usePathname();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-0 translate-y-0 rounded-none border-0 p-0 sm:max-w-full">
        <div className="border-b border-border px-5 py-4">
          <div className="text-sm font-semibold">Trajectory OS</div>
        </div>
        <nav className="p-2">
          <ul className="space-y-0.5">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
