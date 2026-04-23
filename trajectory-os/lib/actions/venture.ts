"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { ventureSchema } from "@/lib/validations";

export async function createVentureUpdate(raw: unknown) {
  const userId = await getCurrentUserId();
  const data = ventureSchema.parse(raw);
  const v = await prisma.ventureUpdate.create({
    data: {
      userId,
      date: new Date(data.date),
      ventureName: data.ventureName,
      metricName: data.metricName,
      metricValue: data.metricValue,
      priority: data.priority || null,
      blocker: data.blocker || null,
      nextMilestone: data.nextMilestone || null,
      notes: data.notes || null,
    },
  });
  revalidatePath("/venture");
  revalidatePath("/dashboard");
  return v;
}

export async function updateVentureUpdate(id: string, raw: unknown) {
  const userId = await getCurrentUserId();
  const data = ventureSchema.partial().parse(raw);
  const v = await prisma.ventureUpdate.update({
    where: { id, userId },
    data: {
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.ventureName !== undefined && { ventureName: data.ventureName }),
      ...(data.metricName !== undefined && { metricName: data.metricName }),
      ...(data.metricValue !== undefined && { metricValue: data.metricValue }),
      ...(data.priority !== undefined && { priority: data.priority || null }),
      ...(data.blocker !== undefined && { blocker: data.blocker || null }),
      ...(data.nextMilestone !== undefined && { nextMilestone: data.nextMilestone || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
  });
  revalidatePath("/venture");
  revalidatePath("/dashboard");
  return v;
}

export async function deleteVentureUpdate(id: string) {
  const userId = await getCurrentUserId();
  await prisma.ventureUpdate.delete({ where: { id, userId } });
  revalidatePath("/venture");
  revalidatePath("/dashboard");
}
