import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(n: number, opts?: { compact?: boolean }) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: opts?.compact ? "compact" : "standard",
  }).format(n);
}

export function formatNumber(n: number, opts?: { compact?: boolean; digits?: number }) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: opts?.digits ?? 1,
    notation: opts?.compact ? "compact" : "standard",
  }).format(n);
}

export function formatDate(d: Date | string | null | undefined, style: "short" | "long" = "short") {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", {
    month: style === "short" ? "short" : "long",
    day: "numeric",
    year: style === "long" ? "numeric" : undefined,
  });
}

export function formatRelative(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff === -1) return "yesterday";
  if (diff > 0 && diff < 14) return `in ${diff}d`;
  if (diff < 0 && diff > -14) return `${Math.abs(diff)}d ago`;
  return formatDate(date);
}

export function weekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday-based week
  d.setDate(d.getDate() + diff);
  return d;
}

export function monthStart(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
