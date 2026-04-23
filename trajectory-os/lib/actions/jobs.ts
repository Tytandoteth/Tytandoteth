"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { jobLeadSchema, JobStage } from "@/lib/validations";

function toDateOrNull(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function normalize(data: Partial<{
  company: string;
  role: string;
  source?: string;
  location?: string;
  compensationEstimate?: string;
  stage: string;
  link?: string;
  nextAction?: string;
  followUpDate?: string;
  probability?: number | null;
  notes?: string;
}>) {
  return {
    ...(data.company !== undefined && { company: data.company }),
    ...(data.role !== undefined && { role: data.role }),
    ...(data.source !== undefined && { source: data.source || null }),
    ...(data.location !== undefined && { location: data.location || null }),
    ...(data.compensationEstimate !== undefined && {
      compensationEstimate: data.compensationEstimate || null,
    }),
    ...(data.stage !== undefined && { stage: data.stage }),
    ...(data.link !== undefined && { link: data.link || null }),
    ...(data.nextAction !== undefined && { nextAction: data.nextAction || null }),
    ...(data.followUpDate !== undefined && { followUpDate: toDateOrNull(data.followUpDate) }),
    ...(data.probability !== undefined && { probability: data.probability ?? null }),
    ...(data.notes !== undefined && { notes: data.notes || null }),
  };
}

export async function createJobLead(raw: unknown) {
  const userId = await getCurrentUserId();
  const data = jobLeadSchema.parse(raw);
  const lead = await prisma.jobLead.create({
    data: { userId, ...normalize(data), company: data.company, role: data.role, stage: data.stage },
  });
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  return lead;
}

export async function updateJobLead(id: string, raw: unknown) {
  const userId = await getCurrentUserId();
  const data = jobLeadSchema.partial().parse(raw);
  const lead = await prisma.jobLead.update({
    where: { id, userId },
    data: normalize(data),
  });
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  return lead;
}

export async function updateJobStage(id: string, stage: string) {
  const userId = await getCurrentUserId();
  JobStage.parse(stage);
  await prisma.jobLead.update({
    where: { id, userId },
    data: { stage },
  });
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
}

export async function deleteJobLead(id: string) {
  const userId = await getCurrentUserId();
  await prisma.jobLead.delete({ where: { id, userId } });
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
}
