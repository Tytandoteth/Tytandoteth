import type { WeeklyCommitment, User } from "@prisma/client";
import { clamp } from "@/lib/utils";

export type ScoreCategory = "jobs" | "fitness" | "content" | "finance" | "venture";

export type ScoreBreakdown = {
  category: ScoreCategory;
  weight: number;
  completionRate: number; // 0..1
  earned: number; // rounded points
  completed: number;
  target: number;
};

export type WeeklyScore = {
  total: number;
  max: number;
  breakdowns: ScoreBreakdown[];
};

export function getWeights(user: Pick<User, "weightJobs" | "weightFitness" | "weightContent" | "weightFinance" | "weightVenture">) {
  return {
    jobs: user.weightJobs,
    fitness: user.weightFitness,
    content: user.weightContent,
    finance: user.weightFinance,
    venture: user.weightVenture,
  } as Record<ScoreCategory, number>;
}

/**
 * Compute the weekly score from weekly commitments.
 *
 * For each category: completion_rate = sum(completed) / sum(target), clamped to [0, 1].
 * Earned points = completion_rate * weight.
 * Total is the sum of all category earned points.
 */
export function computeWeeklyScore(
  commitments: Pick<WeeklyCommitment, "category" | "target" | "completed">[],
  user: Pick<User, "weightJobs" | "weightFitness" | "weightContent" | "weightFinance" | "weightVenture">,
): WeeklyScore {
  const weights = getWeights(user);
  const categories: ScoreCategory[] = ["jobs", "fitness", "content", "finance", "venture"];

  const breakdowns: ScoreBreakdown[] = categories.map((category) => {
    const forCat = commitments.filter((c) => c.category === category);
    const target = forCat.reduce((sum, c) => sum + (c.target || 0), 0);
    const completed = forCat.reduce((sum, c) => sum + (c.completed || 0), 0);
    const rate = target > 0 ? clamp(completed / target, 0, 1) : 0;
    const weight = weights[category] ?? 0;
    return {
      category,
      weight,
      completionRate: rate,
      earned: Math.round(rate * weight),
      completed,
      target,
    };
  });

  const total = breakdowns.reduce((sum, b) => sum + b.earned, 0);
  const max = Object.values(weights).reduce((a, b) => a + b, 0);

  return { total, max, breakdowns };
}

export const DEFAULT_WEIGHTS: Record<ScoreCategory, number> = {
  jobs: 30,
  fitness: 25,
  content: 20,
  finance: 15,
  venture: 10,
};
