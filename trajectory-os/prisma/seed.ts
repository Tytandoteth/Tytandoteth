import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helpers
const today = new Date();
today.setHours(0, 0, 0, 0);

function daysAgo(n: number): Date {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d;
}
function weekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as week start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  const email = process.env.SEED_USER_EMAIL ?? "founder@trajectory.os";
  const name = process.env.SEED_USER_NAME ?? "Operator";

  console.log(`Seeding for user ${email}...`);

  // Wipe user-scoped data if the user already exists so seed is idempotent.
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.$transaction([
      prisma.goal.deleteMany({ where: { userId: existing.id } }),
      prisma.weeklyCommitment.deleteMany({ where: { userId: existing.id } }),
      prisma.jobLead.deleteMany({ where: { userId: existing.id } }),
      prisma.workout.deleteMany({ where: { userId: existing.id } }),
      prisma.contentItem.deleteMany({ where: { userId: existing.id } }),
      prisma.finance.deleteMany({ where: { userId: existing.id } }),
      prisma.ventureUpdate.deleteMany({ where: { userId: existing.id } }),
      prisma.dailyCheckin.deleteMany({ where: { userId: existing.id } }),
      prisma.weeklyReview.deleteMany({ where: { userId: existing.id } }),
    ]);
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: {
      email,
      name,
      monthlyBurnTarget: 7500,
      savingsTarget: 75000,
      liquidCashStart: 42000,
    },
  });

  const thisWeek = weekStart(today);
  const lastWeek = weekStart(daysAgo(7));

  // --- Goals ---
  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        title: "Reach 12-month runway by year end",
        description: "Combination of landing a role, cutting burn, and adding freelance income.",
        category: "wealth",
        timeframe: "north_star",
        targetValue: 12,
        currentValue: 5.6,
        unit: "months",
        status: "active",
      },
      {
        userId: user.id,
        title: "Ship Trajectory OS v1 publicly",
        description: "Build in public, launch, hit 500 signups.",
        category: "venture",
        timeframe: "north_star",
        targetValue: 500,
        currentValue: 0,
        unit: "signups",
        status: "active",
      },
      {
        userId: user.id,
        title: "Land founding engineer role at AI-forward seed-to-Series-A",
        category: "job",
        timeframe: "ninety_day",
        targetValue: 1,
        currentValue: 0,
        unit: "offer",
        dueDate: daysAgo(-90),
        status: "active",
      },
      {
        userId: user.id,
        title: "Get to sub-10% body fat",
        category: "fitness",
        timeframe: "ninety_day",
        targetValue: 10,
        currentValue: 14,
        unit: "% bf",
        dueDate: daysAgo(-75),
        status: "active",
      },
      {
        userId: user.id,
        title: "Publish 12 pieces of content",
        category: "content",
        timeframe: "ninety_day",
        targetValue: 12,
        currentValue: 3,
        unit: "posts",
        dueDate: daysAgo(-60),
        status: "active",
      },
    ],
  });

  // --- Weekly Commitments (this week) ---
  await prisma.weeklyCommitment.createMany({
    data: [
      { userId: user.id, weekStart: thisWeek, category: "jobs", title: "5 targeted applications", target: 5, completed: 3 },
      { userId: user.id, weekStart: thisWeek, category: "jobs", title: "3 warm intros requested", target: 3, completed: 2 },
      { userId: user.id, weekStart: thisWeek, category: "fitness", title: "4 lifts", target: 4, completed: 3 },
      { userId: user.id, weekStart: thisWeek, category: "fitness", title: "2 runs", target: 2, completed: 1 },
      { userId: user.id, weekStart: thisWeek, category: "content", title: "3 posts shipped", target: 3, completed: 2 },
      { userId: user.id, weekStart: thisWeek, category: "finance", title: "Weekly burn review", target: 1, completed: 1 },
      { userId: user.id, weekStart: thisWeek, category: "venture", title: "Ship 1 venture milestone", target: 1, completed: 1 },
    ],
  });

  // Last week commitments (fully closed out, for trend)
  await prisma.weeklyCommitment.createMany({
    data: [
      { userId: user.id, weekStart: lastWeek, category: "jobs", title: "5 applications", target: 5, completed: 4 },
      { userId: user.id, weekStart: lastWeek, category: "fitness", title: "4 lifts", target: 4, completed: 4 },
      { userId: user.id, weekStart: lastWeek, category: "content", title: "3 posts", target: 3, completed: 3 },
      { userId: user.id, weekStart: lastWeek, category: "finance", title: "Burn review", target: 1, completed: 1 },
      { userId: user.id, weekStart: lastWeek, category: "venture", title: "Ship milestone", target: 1, completed: 0 },
    ],
  });

  // --- Job leads ---
  await prisma.jobLead.createMany({
    data: [
      {
        userId: user.id,
        company: "Linear",
        role: "Founding Product Engineer",
        source: "Warm intro — Ex-colleague",
        location: "Remote",
        compensationEstimate: "$180–220k + 0.5–1.0%",
        stage: "technical",
        link: "https://linear.app/careers",
        nextAction: "Prepare take-home review for Thursday",
        followUpDate: daysAgo(-2),
        probability: 55,
        notes: "Strong signal from hiring manager. Emphasize 0-to-1 shipping velocity.",
      },
      {
        userId: user.id,
        company: "Modal",
        role: "Founding Engineer (Full-stack)",
        source: "Cold outbound",
        location: "NYC / Remote",
        compensationEstimate: "$200k + meaningful equity",
        stage: "recruiter_screen",
        link: "https://modal.com/careers",
        nextAction: "Recruiter call Monday 10am",
        followUpDate: daysAgo(-4),
        probability: 35,
        notes: "Lead: cold email with Trajectory OS demo link. Reply in 2h.",
      },
      {
        userId: user.id,
        company: "Replicate",
        role: "Product Engineer",
        source: "Referral — Advisor",
        location: "Remote",
        compensationEstimate: "$190k + 0.2–0.5%",
        stage: "applied",
        link: "https://replicate.com/careers",
        nextAction: "Follow up with referrer in 3 days",
        followUpDate: daysAgo(-3),
        probability: 25,
        notes: "Applied through advisor referral. Waiting for intro to hiring manager.",
      },
      {
        userId: user.id,
        company: "Vercel",
        role: "Senior Full-stack Engineer, DX",
        source: "Job board",
        location: "Remote",
        compensationEstimate: "$210–240k",
        stage: "lead",
        link: "https://vercel.com/careers",
        nextAction: "Draft application + tailor resume",
        followUpDate: daysAgo(-1),
        probability: 15,
        notes: "High comp, good fit. Need to find a warm intro before applying cold.",
      },
    ],
  });

  // --- Workouts (last 14 days) ---
  const workoutPlan: Array<{ offset: number; type: string; dur: number; bw: number; done: boolean }> = [
    { offset: 0, type: "Lift — Push", dur: 55, bw: 182.4, done: true },
    { offset: 1, type: "Rest", dur: 0, bw: 182.2, done: false },
    { offset: 2, type: "Run — Z2", dur: 40, bw: 182.0, done: true },
    { offset: 3, type: "Lift — Pull", dur: 60, bw: 181.8, done: true },
    { offset: 4, type: "Mobility", dur: 25, bw: 181.8, done: true },
    { offset: 5, type: "Lift — Legs", dur: 65, bw: 181.6, done: true },
    { offset: 6, type: "Run — Z2", dur: 35, bw: 181.4, done: true },
    { offset: 7, type: "Rest", dur: 0, bw: 181.6, done: false },
    { offset: 8, type: "Lift — Push", dur: 55, bw: 182.0, done: true },
    { offset: 9, type: "Run — Intervals", dur: 30, bw: 182.2, done: true },
    { offset: 10, type: "Lift — Pull", dur: 60, bw: 182.4, done: true },
    { offset: 11, type: "Rest", dur: 0, bw: 182.4, done: false },
    { offset: 12, type: "Lift — Legs", dur: 65, bw: 182.2, done: true },
    { offset: 13, type: "Run — Z2", dur: 45, bw: 182.0, done: true },
  ];
  await prisma.workout.createMany({
    data: workoutPlan.map((w) => ({
      userId: user.id,
      date: daysAgo(w.offset),
      workoutType: w.type,
      durationMin: w.dur,
      completed: w.done,
      bodyweight: w.bw,
      proteinHit: w.done,
      creatineTaken: w.done,
      notes: w.done ? null : "Recovery day",
    })),
  });

  // --- Content items ---
  await prisma.contentItem.createMany({
    data: [
      {
        userId: user.id,
        title: "Why I'm building in public again",
        platform: "twitter",
        format: "thread",
        status: "posted",
        hook: "Three years ago I stopped building in public. Here's what I'm doing differently this time.",
        cta: "Link to Trajectory OS waitlist",
        publishDate: daysAgo(2),
      },
      {
        userId: user.id,
        title: "The founding engineer playbook",
        platform: "linkedin",
        format: "post",
        status: "posted",
        hook: "Founding engineer ≠ senior engineer who works longer hours.",
        cta: "DM me if you're hiring",
        publishDate: daysAgo(5),
      },
      {
        userId: user.id,
        title: "12-month runway: how I think about it",
        platform: "twitter",
        format: "thread",
        status: "drafted",
        hook: "Runway isn't just a number. It's a posture.",
        cta: "Full breakdown in newsletter",
      },
      {
        userId: user.id,
        title: "Trajectory OS demo walkthrough",
        platform: "youtube",
        format: "video",
        status: "recorded",
        hook: "I built my personal operating system. Here's what it tracks.",
        cta: "Waitlist link in description",
      },
      {
        userId: user.id,
        title: "How I run my weekly review",
        platform: "newsletter",
        format: "article",
        status: "drafted",
        hook: "A 15-minute ritual that replaced my entire productivity stack.",
        cta: "Subscribe for the next post",
      },
      {
        userId: user.id,
        title: "Cold outbound to founding roles — my template",
        platform: "linkedin",
        format: "post",
        status: "idea",
        hook: "I sent 40 cold emails to founders. 11 replied. Here's the template.",
      },
      {
        userId: user.id,
        title: "Body recomp at 34 while shipping full-time",
        platform: "blog",
        format: "article",
        status: "idea",
        hook: "No, you don't need two hours a day.",
      },
      {
        userId: user.id,
        title: "Dark mode dashboard aesthetics — before/after",
        platform: "twitter",
        format: "post",
        status: "idea",
        hook: "Redesigning my personal dashboard, one screenshot at a time.",
      },
    ],
  });

  // --- Finances — one month of entries ---
  const incomes = [
    { day: 2, amount: 6200, category: "Freelance", notes: "Client retainer" },
    { day: 15, amount: 1500, category: "Consulting", notes: "One-off sprint" },
    { day: 22, amount: 800, category: "Affiliate", notes: "Referral income" },
  ];
  const expenses = [
    { day: 1, amount: 1850, category: "Rent", notes: "Monthly rent" },
    { day: 3, amount: 320, category: "Groceries" },
    { day: 5, amount: 85, category: "Software" },
    { day: 7, amount: 140, category: "Gym" },
    { day: 9, amount: 220, category: "Food out" },
    { day: 11, amount: 68, category: "Utilities" },
    { day: 14, amount: 190, category: "Groceries" },
    { day: 17, amount: 45, category: "Software" },
    { day: 19, amount: 260, category: "Food out" },
    { day: 21, amount: 110, category: "Health" },
    { day: 24, amount: 180, category: "Groceries" },
    { day: 27, amount: 78, category: "Software" },
  ];
  await prisma.finance.createMany({
    data: [
      ...incomes.map((i) => ({
        userId: user.id,
        date: daysAgo(i.day),
        type: "income",
        category: i.category,
        amount: i.amount,
        notes: i.notes ?? null,
      })),
      ...expenses.map((e) => ({
        userId: user.id,
        date: daysAgo(e.day),
        type: "expense",
        category: e.category,
        amount: e.amount,
        notes: e.notes ?? null,
      })),
    ],
  });

  // --- Venture updates ---
  await prisma.ventureUpdate.createMany({
    data: [
      {
        userId: user.id,
        date: daysAgo(14),
        ventureName: "Trajectory OS",
        metricName: "Waitlist signups",
        metricValue: 42,
        priority: "Land on messaging that resonates with founders, not knowledge workers.",
        blocker: "Landing page copy — rewrote hero 3 times.",
        nextMilestone: "Ship v1 and open waitlist publicly",
      },
      {
        userId: user.id,
        date: daysAgo(7),
        ventureName: "Trajectory OS",
        metricName: "Waitlist signups",
        metricValue: 118,
        priority: "Build dashboard and weekly review loop first.",
        blocker: null,
        nextMilestone: "Dashboard MVP with live data",
      },
      {
        userId: user.id,
        date: daysAgo(0),
        ventureName: "Trajectory OS",
        metricName: "Waitlist signups",
        metricValue: 187,
        priority: "Ship review loop + share build publicly.",
        blocker: "Need to finalize scoring weights.",
        nextMilestone: "Public launch tweet thread",
      },
    ],
  });

  // --- Daily check-ins ---
  await prisma.dailyCheckin.createMany({
    data: [
      {
        userId: user.id,
        date: daysAgo(1),
        topPriority1: "Finish Linear take-home",
        topPriority2: "Ship Trajectory OS dashboard",
        topPriority3: "Reply to Modal recruiter",
        workoutPlanned: true,
        energyLevel: 4,
        stressLevel: 3,
        notes: "Good focus morning. Afternoon got fragmented — block calendar tomorrow.",
      },
      {
        userId: user.id,
        date: daysAgo(0),
        topPriority1: "Ship seed data + review loop",
        topPriority2: "Record Trajectory OS demo video",
        topPriority3: "Lift — push day",
        workoutPlanned: true,
        energyLevel: 4,
        stressLevel: 2,
      },
    ],
  });

  // --- Weekly review (last week) ---
  await prisma.weeklyReview.create({
    data: {
      userId: user.id,
      weekStart: lastWeek,
      wins: "Landed Linear technical round. Shipped content thread that hit 120k views. 4/4 lifts.",
      losses: "Missed one run. Venture milestone slipped — landing page copy rework took longer than expected.",
      lessons: "Content quality compounds fast once the hook is right. Stop re-drafting — publish and iterate.",
      nextWeekFocus: "Close Linear loop. Ship Trajectory OS dashboard. Maintain 4 lifts + 2 runs.",
      scoreJobs: 24,
      scoreFitness: 22,
      scoreContent: 20,
      scoreFinance: 12,
      scoreVenture: 6,
      totalScore: 84,
    },
  });

  console.log("✅ Seed complete.");
  console.log(`   User:     ${user.email}`);
  console.log(`   Goals:    ${await prisma.goal.count({ where: { userId: user.id } })}`);
  console.log(`   Jobs:     ${await prisma.jobLead.count({ where: { userId: user.id } })}`);
  console.log(`   Workouts: ${await prisma.workout.count({ where: { userId: user.id } })}`);
  console.log(`   Content:  ${await prisma.contentItem.count({ where: { userId: user.id } })}`);
  console.log(`   Finance:  ${await prisma.finance.count({ where: { userId: user.id } })}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
