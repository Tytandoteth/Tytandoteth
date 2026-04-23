"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { contentSchema, ContentStatus } from "@/lib/validations";

function toDateOrNull(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export async function createContent(raw: unknown) {
  const userId = await getCurrentUserId();
  const data = contentSchema.parse(raw);
  const item = await prisma.contentItem.create({
    data: {
      userId,
      title: data.title,
      platform: data.platform,
      format: data.format,
      status: data.status,
      hook: data.hook || null,
      cta: data.cta || null,
      publishDate: toDateOrNull(data.publishDate),
      notes: data.notes || null,
    },
  });
  revalidatePath("/content");
  revalidatePath("/dashboard");
  return item;
}

export async function updateContent(id: string, raw: unknown) {
  const userId = await getCurrentUserId();
  const data = contentSchema.partial().parse(raw);
  const item = await prisma.contentItem.update({
    where: { id, userId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.platform !== undefined && { platform: data.platform }),
      ...(data.format !== undefined && { format: data.format }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.hook !== undefined && { hook: data.hook || null }),
      ...(data.cta !== undefined && { cta: data.cta || null }),
      ...(data.publishDate !== undefined && { publishDate: toDateOrNull(data.publishDate) }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
  });
  revalidatePath("/content");
  revalidatePath("/dashboard");
  return item;
}

export async function updateContentStatus(id: string, status: string) {
  const userId = await getCurrentUserId();
  ContentStatus.parse(status);
  const data: { status: string; publishDate?: Date } = { status };
  if (status === "posted") data.publishDate = new Date();
  await prisma.contentItem.update({
    where: { id, userId },
    data,
  });
  revalidatePath("/content");
  revalidatePath("/dashboard");
}

export async function deleteContent(id: string) {
  const userId = await getCurrentUserId();
  await prisma.contentItem.delete({ where: { id, userId } });
  revalidatePath("/content");
  revalidatePath("/dashboard");
}
