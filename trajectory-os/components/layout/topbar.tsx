"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/goals": "Goals",
  "/jobs": "Jobs",
  "/fitness": "Fitness",
  "/content": "Content",
  "/finance": "Finance",
  "/venture": "Venture",
  "/review": "Review",
  "/settings": "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Trajectory OS";
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation"
          onClick={() => setNavOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground md:hidden">
            Trajectory OS
          </Link>
          <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {mounted && resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <MobileNav open={navOpen} onOpenChange={setNavOpen} />
    </header>
  );
}
