import { prisma } from "@/lib/db";

/**
 * MVP single-operator auth stub.
 *
 * No real auth in MVP — returns the seeded operator user. When swapping in
 * Clerk or Supabase Auth, change this to read the session and upsert a user
 * row. Every server action and query call goes through this function, so the
 * rest of the app doesn't need to change.
 */
export async function getCurrentUser() {
  const email = process.env.SEED_USER_EMAIL ?? "founder@trajectory.os";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(
      `No user found for ${email}. Run \`npm run db:seed\` to create the default operator.`,
    );
  }
  return user;
}

export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user.id;
}
