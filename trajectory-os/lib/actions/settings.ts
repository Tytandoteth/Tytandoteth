"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { settingsSchema } from "@/lib/validations";

export async function updateSettings(raw: unknown) {
  const userId = await getCurrentUserId();
  const data = settingsSchema.parse(raw);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyBurnTarget: data.monthlyBurnTarget,
      savingsTarget: data.savingsTarget,
      liquidCashStart: data.liquidCashStart,
      weightJobs: data.weightJobs,
      weightFitness: data.weightFitness,
      weightContent: data.weightContent,
      weightFinance: data.weightFinance,
      weightVenture: data.weightVenture,
    },
  });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return updated;
}
