# Trajectory OS

A personal operating system for a high-agency founder. Tracks life trajectory across wealth, fitness, job search, content, and venture progress — then forces a weekly review loop to keep you honest.

Not a productivity app. Not a project manager. A **dashboard you open every day to answer four questions**:

- Where do I stand right now?
- What matters this week?
- What should I do next?
- Am I actually moving?

---

## Stack

- **Next.js 14** App Router, Server Components, Server Actions
- **TypeScript** end-to-end
- **Tailwind CSS** + **shadcn/ui** (primitives copied in, inspectable)
- **Prisma** ORM — SQLite for dev, Postgres-ready for prod (Supabase / Neon / Railway)
- **React Hook Form** + **Zod** for forms and validation
- **Recharts** for dashboard charts
- **next-themes** for dark/light toggle (dark by default)
- **sonner** for toasts
- **Vercel-ready** deployment

No auth in the MVP — this is a single-operator app. The auth layer is stubbed in [`lib/auth.ts`](./lib/auth.ts) and can be swapped for Clerk or Supabase Auth in one file without touching the rest of the app.

---

## Local setup

### Prerequisites

- Node 20+
- npm 10+ (or pnpm / bun — package.json uses npm scripts)

### Install and seed

```bash
cd trajectory-os
cp .env.example .env
npm install
npm run db:push     # creates SQLite DB from schema.prisma
npm run db:seed     # seeds realistic demo data
npm run dev         # http://localhost:3000
```

You'll be redirected from `/` to `/dashboard`.

### Useful scripts

| Script               | What it does                                              |
| -------------------- | --------------------------------------------------------- |
| `npm run dev`        | Next.js dev server                                        |
| `npm run build`      | Generates Prisma client and builds for production         |
| `npm run start`      | Starts the production server                              |
| `npm run db:push`    | Pushes the Prisma schema to the database                  |
| `npm run db:migrate` | Creates a migration (use when schema stabilizes)          |
| `npm run db:studio`  | Opens Prisma Studio                                       |
| `npm run db:seed`    | Seeds realistic demo data                                 |
| `npm run db:reset`   | Drops the database and re-seeds (destructive, dev only)   |

---

## Folder structure

```
trajectory-os/
├── app/                    # Next.js App Router
│   ├── (app)/              # Authenticated shell group (sidebar layout)
│   │   ├── dashboard/      # High-signal dashboard
│   │   ├── goals/          # North star, 90-day, weekly commitments
│   │   ├── jobs/           # Job search CRM (kanban + table)
│   │   ├── fitness/        # Workout log, bodyweight, streak
│   │   ├── content/        # Idea → posted pipeline
│   │   ├── finance/        # Runway math, burn, savings
│   │   ├── venture/        # Weekly venture metric + blocker
│   │   ├── review/         # Daily check-in + weekly review
│   │   ├── settings/       # Weights, targets, theme
│   │   ├── layout.tsx      # Sidebar + topbar shell
│   │   ├── loading.tsx     # Skeleton loading state
│   │   └── error.tsx       # Error boundary
│   ├── layout.tsx          # Root layout (theme + toaster)
│   ├── page.tsx            # Redirect to /dashboard
│   ├── not-found.tsx
│   └── globals.css         # Dark-first theme tokens
├── components/
│   ├── ui/                 # shadcn primitives (button, card, dialog, …)
│   ├── layout/             # Sidebar, topbar, mobile nav
│   ├── dashboard/          # Finance chart, weekly-score card, next-actions
│   ├── goals/              # Goals + weekly commitment UI
│   ├── jobs/               # Kanban + table + dialog
│   ├── fitness/            # Workout dialog, BW chart, habit grid
│   ├── content/            # Status board + calendar
│   ├── finance/            # Entry dialog, category pie
│   ├── venture/            # Metric chart + update dialog
│   ├── review/             # Check-in + weekly review forms
│   ├── settings/           # Settings form
│   └── shared/             # page-header, stat-card, empty-state
├── lib/
│   ├── db.ts               # Prisma singleton
│   ├── auth.ts             # Single-operator auth stub — replace for real auth
│   ├── utils.ts            # Date/number/format helpers + cn()
│   ├── validations.ts      # Zod schemas + constants (stage labels, etc.)
│   ├── score.ts            # Weekly score engine
│   ├── queries.ts          # Dashboard query aggregator
│   └── actions/            # Server actions per domain
│       ├── goals.ts
│       ├── jobs.ts
│       ├── workouts.ts
│       ├── content.ts
│       ├── finance.ts
│       ├── venture.ts
│       ├── review.ts
│       └── settings.ts
├── prisma/
│   ├── schema.prisma       # 10 models, SQLite-default, Postgres-ready
│   └── seed.ts             # Realistic demo data
├── .env.example
├── components.json         # shadcn config
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Data model

Ten tables, all user-scoped with cascade delete:

| Model                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `User`               | Single operator + settings (weights, targets)             |
| `Goal`               | North star, 90-day, weekly goals with progress tracking   |
| `WeeklyCommitment`   | Concrete weekly promises (drives the score engine)        |
| `JobLead`            | CRM: stage, probability, follow-up, comp, notes           |
| `Workout`            | Date, type, duration, bodyweight, protein/creatine flags  |
| `ContentItem`        | Idea → drafted → recorded → edited → posted → repurposed  |
| `Finance`            | Single-table ledger: income/expense, category, amount     |
| `VentureUpdate`      | One metric + priority + blocker per weekly snapshot       |
| `DailyCheckin`       | Top 3 priorities, energy, stress, notes (one per day)     |
| `WeeklyReview`       | Wins / losses / lessons / next focus + auto-scored totals |

See [`prisma/schema.prisma`](./prisma/schema.prisma) for the full schema.

---

## Weekly score engine

The weekly score (out of 100) is computed from weekly commitments:

```
for each category ∈ {jobs, fitness, content, finance, venture}:
  completion_rate = min(1, sum(completed) / sum(target))
  earned = round(completion_rate * weight)

total = sum(earned)
```

Default weights are configurable in `/settings`:

| Category | Default weight |
| -------- | -------------: |
| Jobs     |             30 |
| Fitness  |             25 |
| Content  |             20 |
| Finance  |             15 |
| Venture  |             10 |

The weekly review auto-saves the snapshot (per-category + total) so your history is accurate even if commitment weights change later.

See [`lib/score.ts`](./lib/score.ts).

---

## Deploying to production

### 1. Swap the database provider

Open `prisma/schema.prisma` and change:

```prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // optional, for Supabase/Neon pooled mode
}
```

### 2. Set env vars (Vercel / Railway / Fly / etc.)

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...      # if using connection pooling
SEED_USER_EMAIL=you@yourdomain.com
SEED_USER_NAME=Your Name
```

### 3. Deploy

On Vercel, the default build pipeline runs `prisma generate && next build` via the `build` script. Run the seed once after provisioning:

```bash
npx prisma db push
npx prisma db seed
```

---

## Design notes / philosophy

- **Dark-first.** Zinc + neutral palette, one accent used sparingly, tight 0.5rem radii.
- **Information density without clutter.** `tabular-nums`, small uppercase labels, thin scrollbars, minimal chrome.
- **Every page makes the next action obvious.** Dashboard has an explicit "next best actions" module. Content board has "move to next status" on hover. Kanban cards have stage dropdowns. Weekly commitments have +/- buttons.
- **Mobile-friendly.** Sidebar collapses to a drawer below `md`. Kanbans scroll horizontally. Stats reflow to 2 cols.
- **No auth in MVP.** Single-operator assumption. Adding Clerk or Supabase is a one-file change — everything routes through `getCurrentUser()` in `lib/auth.ts`.

---

## TODOs / next enhancements

These are deliberately left off the MVP scope but are natural next steps:

1. **Real auth** — Clerk or Supabase Auth. Replace `lib/auth.ts` with a session-based lookup; no other code changes.
2. **Multi-venture support** — schema already allows it, UI filters needed on `/venture`.
3. **Drag-and-drop kanban** — currently stage change via a `Select`. Add `dnd-kit` for drag.
4. **Bulk import** — CSV upload for finance and job leads.
5. **Keyboard shortcuts** — `1-9` for nav, `n` for "new", `/` to focus search (Linear-style).
6. **Command palette** — `cmd+k` overlay for fuzzy navigation and quick-add.
7. **AI assist** — hook-generation for content items; weekly review summary from commitment data; follow-up copy for job leads.
8. **Email digest** — Monday morning "here's your week" email via Resend + cron.
9. **Exports** — one-click JSON export of the whole operator history.
10. **Mobile app** — Expo wrapper calling the same server actions via `/api` route adapters.
11. **Weight-validation UX** — the settings form warns when weights ≠ 100; could auto-normalize.
12. **Undo** — soft-delete + restore on destructive operations.
13. **Per-category goal linking** — associate weekly commitments with parent 90-day goals to auto-update `currentValue`.

---

## License

MIT. Build your own version. Fork it, strip it, rewire it to your life.
