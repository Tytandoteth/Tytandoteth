"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteFinance } from "@/lib/actions/finance";

export function FinanceDelete({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete entry?"))
          startTransition(async () => {
            await deleteFinance(id);
            toast.success("Deleted");
          });
      }}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
