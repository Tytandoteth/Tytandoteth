import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { computeWeeklyScore } from "@/lib/score";
import { monthStart, weekStart } from "@/lib/utils";

export async function getDashboardData() {
  const user = await getCurrentUser();
  const now = new Date();
  const thisWeek = weekStart(now);
  const thisMonth = monthStart(now);
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const [
    finances,
    financesMonth,
    financesAll,
    weekCommitments,
    weekJobApps,
    activeInterviews,
    weekWorkouts,
    weekPosts,
    goals,
    todayCheckin,
    latestVenture,
    ventureHistory,
  ] = await Promise.all([
    prisma.finance.findMany({
      where: { userId: user.id, date: { gte: ninetyDaysAgo } },
      orderBy: { date: "asc" },
    }),
    prisma.finance.findMany({ where: { userId: user.id, date: { gte: thisMonth } } }),
    prisma.finance.findMany({ where: { userId: user.id } }),
    prisma.weeklyCommitment.findMany({ where: { userId: user.id, weekStart: thisWeek } }),
    prisma.jobLead.count({
      where: {
        userId: user.id,
        stage: "applied",
        updatedAt: { gte: thisWeek },
      },
    }),
    prisma.jobLead.count({
      where: {
        userId: user.id,
        stage: { in: ["recruiter_screen", "technical", "final_round"] },
      },
    }),
    prisma.workout.count({
      where: { userId: user.id, completed: true, date: { gte: thisWeek } },
    }),
    prisma.contentItem.count({
      where: { userId: user.id, status: "posted", publishDate: { gte: thisWeek } },
    }),
    prisma.goal.findMany({
      where: { userId: user.id, timeframe: "ninety_day", status: "active" },
      orderBy: { dueDate: "asc" },
    }),
    prisma.dailyCheckin.findFirst({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    }),
    prisma.ventureUpdate.findFirst({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    }),
    prisma.ventureUpdate.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
      take: 12,
    }),
  ]);

  // Net cash position: sum of all finances (income positive, expense negative) + opening balance
  const netFlows = financesAll.reduce(
    (sum, f) => sum + (f.type === "income" ? f.amount : -f.amount),
    0,
  );
  const liquidCash = user.liquidCashStart + netFlows;

  // Monthly burn: last 30 days
  const expenses30 = finances
    .filter((f) => f.type === "expense" && f.date >= monthAgo)
    .reduce((s, f) => s + f.amount, 0);
  const income30 = finances
    .filter((f) => f.type === "income" && f.date >= monthAgo)
    .reduce((s, f) => s + f.amount, 0);
  const monthlyBurn = Math.max(0, expenses30 - income30);
  const runwayMonths = monthlyBurn > 0 ? liquidCash / monthlyBurn : Infinity;

  const incomeMonth = financesMonth
    .filter((f) => f.type === "income")
    .reduce((s, f) => s + f.amount, 0);
  const expenseMonth = financesMonth
    .filter((f) => f.type === "expense")
    .reduce((s, f) => s + f.amount, 0);

  // 30-day finance chart (daily buckets, net)
  const daily = new Map<string, { date: string; net: number; cumulative: number }>();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 29);
  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    daily.set(key, { date: key, net: 0, cumulative: 0 });
  }
  for (const f of finances) {
    const key = f.date.toISOString().slice(0, 10);
    const bucket = daily.get(key);
    if (bucket) bucket.net += f.type === "income" ? f.amount : -f.amount;
  }
  let cumulative = liquidCash - financesAll
    .filter((f) => f.date >= startDate)
    .reduce((s, f) => s + (f.type === "income" ? f.amount : -f.amount), 0);
  const financeSeries = Array.from(daily.values()).map((b) => {
    cumulative += b.net;
    return { date: b.date, cash: Math.round(cumulative), net: Math.round(b.net) };
  });

  const weeklyScore = computeWeeklyScore(weekCommitments, user);
  const nextActions = await deriveNextActions(user.id);

  return {
    user,
    stats: {
      liquidCash,
      monthlyBurn,
      runwayMonths,
      incomeMonth,
      expenseMonth,
      weekJobApps,
      activeInterviews,
      weekWorkouts,
      weekPosts,
    },
    weeklyScore,
    goals,
    todayCheckin,
    latestVenture,
    ventureHistory,
    financeSeries,
    weekCommitments,
    nextActions,
  };
}

async function deriveNextActions(userId: string) {
  const [overdueFollowUps, staleApps, ideaDrought, blockerVenture] = await Promise.all([
    prisma.jobLead.findMany({
      where: {
        userId,
        followUpDate: { lte: new Date() },
        stage: { notIn: ["offer", "rejected", "archived"] },
      },
      orderBy: { followUpDate: "asc" },
      take: 3,
    }),
    prisma.jobLead.count({
      where: { userId, stage: "applied", updatedAt: { lt: new Date(Date.now() - 7 * 86400000) } },
    }),
    prisma.contentItem.count({ where: { userId, status: { in: ["idea", "drafted"] } } }),
    prisma.ventureUpdate.findFirst({
      where: { userId, blocker: { not: null } },
      orderBy: { date: "desc" },
    }),
  ]);

  const actions: { kind: string; text: string; href: string }[] = [];
  for (const f of overdueFollowUps) {
    actions.push({
      kind: "jobs",
      text: `Follow up with ${f.company} — ${f.nextAction ?? "next step"}`,
      href: "/jobs",
    });
  }
  if (staleApps >= 2) {
    actions.push({
      kind: "jobs",
      text: `Re-engage ${staleApps} applications stuck >7 days`,
      href: "/jobs",
    });
  }
  if (ideaDrought < 3) {
    actions.push({ kind: "content", text: "Refill the content backlog — under 3 ideas queued", href: "/content" });
  }
  if (blockerVenture?.blocker) {
    actions.push({
      kind: "venture",
      text: `Unblock: ${blockerVenture.blocker}`,
      href: "/venture",
    });
  }
  if (actions.length === 0) {
    actions.push({ kind: "review", text: "Run your daily check-in", href: "/review" });
  }
  return actions.slice(0, 5);
}
