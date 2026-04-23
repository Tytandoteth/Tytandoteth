import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">404</div>
      <h1 className="text-xl font-semibold tracking-tight">Off-route</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This page isn't part of your operating system.
      </p>
      <Button asChild size="sm" className="mt-2">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
