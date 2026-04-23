"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { goalSchema, commitmentSchema } from "@/lib/validations";
import { weekStart } from "@/lib/utils";

function toDateOrNull(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export async function createGoal(raw: unknown) {
  const userId = await getCurrentUserId();
  const data = goalSchema.parse(raw);
  const goal = await prisma.goal.create({
    data: {
      userId,
      title: data.title,
      description: data.description || null,
      category: data.category,
      timeframe: data.timeframe,
      targetValue: data.targetValue ?? null,
      currentValue: data.currentValue ?? null,
      unit: data.unit || null,
      dueDate: toDateOrNull(data.dueDate),
      status: data.status ?? "active",
    },
  });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return goal;
}

export async function updateGoal(id: string, raw: unknown) {
  const userId = await getCurrentUserId();
  const data = goalSchema.partial().parse(raw);
  const goal = await prisma.goal.update({
    where: { id, userId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.timeframe !== undefined && { timeframe: data.timeframe }),
      ...(data.targetValue !== undefined && { targetValue: data.targetValue }),
      ...(data.currentValue !== undefined && { currentValue: data.currentValue }),
      ...(data.unit !== undefined && { unit: data.unit || null }),
      ...(data.dueDate !== undefined && { dueDate: toDateOrNull(data.dueDate) }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return goal;
}

export async function deleteGoal(id: string) {
  const userId = await getCurrentUserId();
  await prisma.goal.delete({ where: { id, userId } });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function createCommitment(raw: unknown) {
  const userId = await getCurrentUserId();
  const data = commitmentSchema.parse(raw);
  const ws = data.weekStart ? new Date(data.weekStart) : weekStart();
  ws.setHours(0, 0, 0, 0);
  const c = await prisma.weeklyCommitment.create({
    data: {
      userId,
      weekStart: ws,
      category: data.category,
      title: data.title,
      target: data.target,
      completed: data.completed ?? 0,
    },
  });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  revalidatePath("/review");
  return c;
}

export async function updateCommitment(id: string, raw: unknown) {
  const userId = await getCurrentUserId();
  const data = commitmentSchema.partial().parse(raw);
  const c = await prisma.weeklyCommitment.update({
    where: { id, userId },
    data: {
      ...(data.category !== undefined && { category: data.category }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.target !== undefined && { target: data.target }),
      ...(data.completed !== undefined && { completed: data.completed }),
    },
  });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  revalidatePath("/review");
  return c;
}

export async function incrementCommitment(id: string, delta: number) {
  const userId = await getCurrentUserId();
  const existing = await prisma.weeklyCommitment.findFirst({ where: { id, userId } });
  if (!existing) return;
  const next = Math.max(0, Math.min(existing.target, existing.completed + delta));
  await prisma.weeklyCommitment.update({
    where: { id },
    data: { completed: next },
  });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  revalidatePath("/review");
}

export async function deleteCommitment(id: string) {
  const userId = await getCurrentUserId();
  await prisma.weeklyCommitment.delete({ where: { id, userId } });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  revalidatePath("/review");
}
