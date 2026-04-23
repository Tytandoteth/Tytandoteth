import { z } from "zod";

// Shared enums kept in sync with schema.prisma string fields.
export const GoalCategory = z.enum(["wealth", "fitness", "job", "content", "venture", "other"]);
export const GoalTimeframe = z.enum(["north_star", "ninety_day", "weekly"]);
export const GoalStatus = z.enum(["active", "paused", "done", "dropped"]);

export const CommitmentCategory = z.enum(["jobs", "fitness", "content", "finance", "venture"]);

export const JobStage = z.enum([
  "lead",
  "applied",
  "recruiter_screen",
  "technical",
  "final_round",
  "offer",
  "rejected",
  "archived",
]);

export const ContentStatus = z.enum(["idea", "drafted", "recorded", "edited", "posted", "repurposed"]);
export const ContentPlatform = z.enum(["twitter", "linkedin", "youtube", "blog", "tiktok", "newsletter"]);
export const ContentFormat = z.enum(["post", "thread", "video", "article", "short", "newsletter"]);

export const FinanceType = z.enum(["income", "expense"]);

// --- Goal ---
export const goalSchema = z.object({
  title: z.string().min(1, "Title is required").max(140),
  description: z.string().max(1000).optional().or(z.literal("")),
  category: GoalCategory,
  timeframe: GoalTimeframe,
  targetValue: z.coerce.number().nonnegative().optional().nullable(),
  currentValue: z.coerce.number().nonnegative().optional().nullable(),
  unit: z.string().max(20).optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  status: GoalStatus.default("active"),
});
export type GoalInput = z.infer<typeof goalSchema>;

// --- Weekly Commitment ---
export const commitmentSchema = z.object({
  category: CommitmentCategory,
  title: z.string().min(1).max(140),
  target: z.coerce.number().int().min(1).max(100),
  completed: z.coerce.number().int().min(0).max(100),
  weekStart: z.string().optional(), // ISO date; defaults to current week server-side
});
export type CommitmentInput = z.infer<typeof commitmentSchema>;

// --- Job Lead ---
export const jobLeadSchema = z.object({
  company: z.string().min(1).max(140),
  role: z.string().min(1).max(140),
  source: z.string().max(140).optional().or(z.literal("")),
  location: z.string().max(140).optional().or(z.literal("")),
  compensationEstimate: z.string().max(140).optional().or(z.literal("")),
  stage: JobStage,
  link: z.string().url().optional().or(z.literal("")),
  nextAction: z.string().max(280).optional().or(z.literal("")),
  followUpDate: z.string().optional().or(z.literal("")),
  probability: z.coerce.number().int().min(0).max(100).optional().nullable(),
  notes: z.string().max(2000).optional().or(z.literal("")),
});
export type JobLeadInput = z.infer<typeof jobLeadSchema>;

// --- Workout ---
export const workoutSchema = z.object({
  date: z.string().min(1),
  workoutType: z.string().min(1).max(60),
  durationMin: z.coerce.number().int().min(0).max(600),
  completed: z.coerce.boolean().optional().default(true),
  bodyweight: z.coerce.number().positive().optional().nullable(),
  proteinHit: z.coerce.boolean().optional().default(false),
  creatineTaken: z.coerce.boolean().optional().default(false),
  notes: z.string().max(500).optional().or(z.literal("")),
});
export type WorkoutInput = z.infer<typeof workoutSchema>;

// --- Content Item ---
export const contentSchema = z.object({
  title: z.string().min(1).max(180),
  platform: ContentPlatform,
  format: ContentFormat,
  status: ContentStatus,
  hook: z.string().max(500).optional().or(z.literal("")),
  cta: z.string().max(280).optional().or(z.literal("")),
  publishDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});
export type ContentInput = z.infer<typeof contentSchema>;

// --- Finance ---
export const financeSchema = z.object({
  date: z.string().min(1),
  type: FinanceType,
  category: z.string().min(1).max(60),
  amount: z.coerce.number().positive(),
  notes: z.string().max(500).optional().or(z.literal("")),
});
export type FinanceInput = z.infer<typeof financeSchema>;

// --- Venture Update ---
export const ventureSchema = z.object({
  date: z.string().min(1),
  ventureName: z.string().min(1).max(140),
  metricName: z.string().min(1).max(60),
  metricValue: z.coerce.number(),
  priority: z.string().max(280).optional().or(z.literal("")),
  blocker: z.string().max(280).optional().or(z.literal("")),
  nextMilestone: z.string().max(280).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});
export type VentureInput = z.infer<typeof ventureSchema>;

// --- Daily Check-in ---
export const checkinSchema = z.object({
  date: z.string().min(1),
  topPriority1: z.string().max(200).optional().or(z.literal("")),
  topPriority2: z.string().max(200).optional().or(z.literal("")),
  topPriority3: z.string().max(200).optional().or(z.literal("")),
  workoutPlanned: z.coerce.boolean().optional().default(false),
  energyLevel: z.coerce.number().int().min(1).max(5).optional().nullable(),
  stressLevel: z.coerce.number().int().min(1).max(5).optional().nullable(),
  notes: z.string().max(1000).optional().or(z.literal("")),
});
export type CheckinInput = z.infer<typeof checkinSchema>;

// --- Weekly Review ---
export const weeklyReviewSchema = z.object({
  weekStart: z.string().min(1),
  wins: z.string().max(2000).optional().or(z.literal("")),
  losses: z.string().max(2000).optional().or(z.literal("")),
  lessons: z.string().max(2000).optional().or(z.literal("")),
  nextWeekFocus: z.string().max(2000).optional().or(z.literal("")),
});
export type WeeklyReviewInput = z.infer<typeof weeklyReviewSchema>;

// --- Settings ---
export const settingsSchema = z.object({
  monthlyBurnTarget: z.coerce.number().nonnegative(),
  savingsTarget: z.coerce.number().nonnegative(),
  liquidCashStart: z.coerce.number(),
  weightJobs: z.coerce.number().int().min(0).max(100),
  weightFitness: z.coerce.number().int().min(0).max(100),
  weightContent: z.coerce.number().int().min(0).max(100),
  weightFinance: z.coerce.number().int().min(0).max(100),
  weightVenture: z.coerce.number().int().min(0).max(100),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

// Constants for dropdown / display layers
export const JOB_STAGE_LABELS: Record<z.infer<typeof JobStage>, string> = {
  lead: "Lead",
  applied: "Applied",
  recruiter_screen: "Recruiter screen",
  technical: "Technical",
  final_round: "Final round",
  offer: "Offer",
  rejected: "Rejected",
  archived: "Archived",
};
export const JOB_STAGES_ORDER: z.infer<typeof JobStage>[] = [
  "lead",
  "applied",
  "recruiter_screen",
  "technical",
  "final_round",
  "offer",
  "rejected",
  "archived",
];

export const CONTENT_STATUS_LABELS: Record<z.infer<typeof ContentStatus>, string> = {
  idea: "Idea",
  drafted: "Drafted",
  recorded: "Recorded",
  edited: "Edited",
  posted: "Posted",
  repurposed: "Repurposed",
};
export const CONTENT_STATUSES_ORDER: z.infer<typeof ContentStatus>[] = [
  "idea",
  "drafted",
  "recorded",
  "edited",
  "posted",
  "repurposed",
];
