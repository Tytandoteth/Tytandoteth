"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { workoutSchema } from "@/lib/validations";

export async function createWorkout(raw: unknown) {
  const userId = await getCurrentUserId();
  const data = workoutSchema.parse(raw);
  const workout = await prisma.workout.create({
    data: {
      userId,
      date: new Date(data.date),
      workoutType: data.workoutType,
      durationMin: data.durationMin,
      completed: data.completed ?? true,
      bodyweight: data.bodyweight ?? null,
      proteinHit: data.proteinHit ?? false,
      creatineTaken: data.creatineTaken ?? false,
      notes: data.notes || null,
    },
  });
  revalidatePath("/fitness");
  revalidatePath("/dashboard");
  return workout;
}

export async function updateWorkout(id: string, raw: unknown) {
  const userId = await getCurrentUserId();
  const data = workoutSchema.partial().parse(raw);
  const workout = await prisma.workout.update({
    where: { id, userId },
    data: {
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.workoutType !== undefined && { workoutType: data.workoutType }),
      ...(data.durationMin !== undefined && { durationMin: data.durationMin }),
      ...(data.completed !== undefined && { completed: data.completed }),
      ...(data.bodyweight !== undefined && { bodyweight: data.bodyweight ?? null }),
      ...(data.proteinHit !== undefined && { proteinHit: data.proteinHit }),
      ...(data.creatineTaken !== undefined && { creatineTaken: data.creatineTaken }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
  });
  revalidatePath("/fitness");
  revalidatePath("/dashboard");
  return workout;
}

export async function deleteWorkout(id: string) {
  const userId = await getCurrentUserId();
  await prisma.workout.delete({ where: { id, userId } });
  revalidatePath("/fitness");
  revalidatePath("/dashboard");
}
