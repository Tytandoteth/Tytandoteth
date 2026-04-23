"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, getCurrentUserId } from "@/lib/auth";
import { checkinSchema, weeklyReviewSchema } from "@/lib/validations";
import { computeWeeklyScore } from "@/lib/score";
import { weekStart } from "@/lib/utils";

export async function upsertDailyCheckin(raw: unknown) {
  const userId = await getCurrentUserId();
  const data = checkinSchema.parse(raw);
  const date = new Date(data.date);
  date.setHours(0, 0, 0, 0);

  const checkin = await prisma.dailyCheckin.upsert({
    where: { userId_date: { userId, date } },
    update: {
      topPriority1: data.topPriority1 || null,
      topPriority2: data.topPriority2 || null,
      topPriority3: data.topPriority3 || null,
      workoutPlanned: data.workoutPlanned ?? false,
      energyLevel: data.energyLevel ?? null,
      stressLevel: data.stressLevel ?? null,
      notes: data.notes || null,
    },
    create: {
      userId,
      date,
      topPriority1: data.topPriority1 || null,
      topPriority2: data.topPriority2 || null,
      topPriority3: data.topPriority3 || null,
      workoutPlanned: data.workoutPlanned ?? false,
      energyLevel: data.energyLevel ?? null,
      stressLevel: data.stressLevel ?? null,
      notes: data.notes || null,
    },
  });
  revalidatePath("/review");
  revalidatePath("/dashboard");
  return checkin;
}

export async function upsertWeeklyReview(raw: unknown) {
  const user = await getCurrentUser();
  const data = weeklyReviewSchema.parse(raw);
  const ws = new Date(data.weekStart);
  ws.setHours(0, 0, 0, 0);

  const commitments = await prisma.weeklyCommitment.findMany({
    where: { userId: user.id, weekStart: ws },
  });
  const score = computeWeeklyScore(commitments, user);
  const byCat = Object.fromEntries(score.breakdowns.map((b) => [b.category, b.earned])) as Record<
    string,
    number
  >;

  const review = await prisma.weeklyReview.upsert({
    where: { userId_weekStart: { userId: user.id, weekStart: ws } },
    update: {
      wins: data.wins || null,
      losses: data.losses || null,
      lessons: data.lessons || null,
      nextWeekFocus: data.nextWeekFocus || null,
      scoreJobs: byCat.jobs ?? 0,
      scoreFitness: byCat.fitness ?? 0,
      scoreContent: byCat.content ?? 0,
      scoreFinance: byCat.finance ?? 0,
      scoreVenture: byCat.venture ?? 0,
      totalScore: score.total,
    },
    create: {
      userId: user.id,
      weekStart: ws,
      wins: data.wins || null,
      losses: data.losses || null,
      lessons: data.lessons || null,
      nextWeekFocus: data.nextWeekFocus || null,
      scoreJobs: byCat.jobs ?? 0,
      scoreFitness: byCat.fitness ?? 0,
      scoreContent: byCat.content ?? 0,
      scoreFinance: byCat.finance ?? 0,
      scoreVenture: byCat.venture ?? 0,
      totalScore: score.total,
    },
  });
  revalidatePath("/review");
  revalidatePath("/dashboard");
  return review;
}

export async function getCurrentWeekStartIso() {
  return weekStart().toISOString();
}
