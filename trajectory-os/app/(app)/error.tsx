"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const needsSeed =
    error.message.toLowerCase().includes("no user found") ||
    error.message.toLowerCase().includes("run `npm run db:seed`");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-destructive/40 text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h2 className="text-base font-semibold">Something went wrong</h2>
      <p className="max-w-md text-xs text-muted-foreground">{error.message}</p>
      {needsSeed ? (
        <p className="max-w-md rounded-md border border-border bg-card p-3 text-[11px] text-muted-foreground">
          Run <code className="font-mono">npm run db:push && npm run db:seed</code> to initialize the database.
        </p>
      ) : null}
      <Button onClick={reset} size="sm" className="mt-2">
        Try again
      </Button>
    </div>
  );
}
