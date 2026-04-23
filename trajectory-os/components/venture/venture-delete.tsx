"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteVentureUpdate } from "@/lib/actions/venture";

export function VentureDelete({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete?"))
          startTransition(async () => {
            await deleteVentureUpdate(id);
            toast.success("Deleted");
          });
      }}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
