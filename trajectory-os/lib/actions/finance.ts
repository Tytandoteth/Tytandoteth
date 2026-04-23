"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { financeSchema } from "@/lib/validations";

export async function createFinance(raw: unknown) {
  const userId = await getCurrentUserId();
  const data = financeSchema.parse(raw);
  const f = await prisma.finance.create({
    data: {
      userId,
      date: new Date(data.date),
      type: data.type,
      category: data.category,
      amount: data.amount,
      notes: data.notes || null,
    },
  });
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return f;
}

export async function updateFinance(id: string, raw: unknown) {
  const userId = await getCurrentUserId();
  const data = financeSchema.partial().parse(raw);
  const f = await prisma.finance.update({
    where: { id, userId },
    data: {
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
  });
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return f;
}

export async function deleteFinance(id: string) {
  const userId = await getCurrentUserId();
  await prisma.finance.delete({ where: { id, userId } });
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}
