import { ArrowDown, ArrowUp, DollarSign, PiggyBank, Timer, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { FinanceDialog } from "@/components/finance/finance-dialog";
import { FinanceDelete } from "@/components/finance/finance-delete";
import { CategoryPie } from "@/components/finance/category-pie";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatCurrency, formatDate, formatNumber, monthStart } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const user = await getCurrentUser();
  const thisMonth = monthStart();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [all, month, recent] = await Promise.all([
    prisma.finance.findMany({ where: { userId: user.id }, orderBy: { date: "desc" } }),
    prisma.finance.findMany({ where: { userId: user.id, date: { gte: thisMonth } } }),
    prisma.finance.findMany({
      where: { userId: user.id, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    }),
  ]);

  const netFlows = all.reduce((s, f) => s + (f.type === "income" ? f.amount : -f.amount), 0);
  const liquidCash = user.liquidCashStart + netFlows;

  const incomeMonth = month.filter((f) => f.type === "income").reduce((s, f) => s + f.amount, 0);
  const expenseMonth = month.filter((f) => f.type === "expense").reduce((s, f) => s + f.amount, 0);

  const expenses30 = recent.filter((f) => f.type === "expense").reduce((s, f) => s + f.amount, 0);
  const income30 = recent.filter((f) => f.type === "income").reduce((s, f) => s + f.amount, 0);
  const monthlyBurn = Math.max(0, expenses30 - income30);
  const runway = monthlyBurn > 0 ? liquidCash / monthlyBurn : Infinity;

  const savingsPct =
    user.savingsTarget > 0 ? Math.max(0, Math.min(100, (liquidCash / user.savingsTarget) * 100)) : 0;

  // Category breakdown for current month expenses
  const byCategory = new Map<string, number>();
  for (const f of month) {
    if (f.type === "expense") byCategory.set(f.category, (byCategory.get(f.category) ?? 0) + f.amount);
  }
  const pieData = Array.from(byCategory.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        description="Runway math, not accounting. Income, expenses, cash."
        action={<FinanceDialog />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Liquid cash" value={formatCurrency(liquidCash, { compact: true })} icon={DollarSign} />
        <StatCard
          label="Monthly burn"
          value={formatCurrency(monthlyBurn, { compact: true })}
          hint={`Target ${formatCurrency(user.monthlyBurnTarget, { compact: true })}`}
          icon={TrendingDown}
          tone={monthlyBurn <= user.monthlyBurnTarget ? "success" : "warning"}
        />
        <StatCard
          label="Runway"
          value={!isFinite(runway) ? "∞" : `${formatNumber(runway, { digits: 1 })} mo`}
          hint="Based on trailing 30d"
          icon={Timer}
          tone={isFinite(runway) && runway < 4 ? "destructive" : "default"}
        />
        <StatCard label="Income (mo)" value={formatCurrency(incomeMonth, { compact: true })} icon={ArrowUp} tone="success" />
        <StatCard label="Expense (mo)" value={formatCurrency(expenseMonth, { compact: true })} icon={ArrowDown} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card lg:col-span-2">
          <div className="border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">Savings target</div>
            <div className="text-[11px] text-muted-foreground">
              {formatCurrency(liquidCash, { compact: true })} of {formatCurrency(user.savingsTarget, { compact: true })}
            </div>
          </div>
          <div className="space-y-3 p-4">
            <Progress value={savingsPct} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(savingsPct)}% of target</span>
              <span className="tabular-nums">
                {formatCurrency(Math.max(0, user.savingsTarget - liquidCash), { compact: true })} to go
              </span>
            </div>
            <div className="pt-3 text-[11px] text-muted-foreground">
              <PiggyBank className="-ml-0.5 mr-1 inline h-3 w-3" />
              Change target in Settings.
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">Expense breakdown</div>
            <div className="text-[11px] text-muted-foreground">This month</div>
          </div>
          <div className="p-2">
            {pieData.length > 0 ? (
              <div>
                <CategoryPie data={pieData} />
                <ul className="mt-2 space-y-1 px-2 text-[11px]">
                  {pieData.slice(0, 5).map((p) => (
                    <li key={p.name} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{p.name}</span>
                      <span className="tabular-nums">{formatCurrency(p.value, { compact: true })}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <EmptyState title="No expenses this month" description="Add your first entry." />
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-semibold">Recent entries</div>
          <FinanceDialog />
        </div>
        {all.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={DollarSign} title="No entries yet" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {all.slice(0, 40).map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(f.date)}</TableCell>
                  <TableCell>
                    <Badge variant={f.type === "income" ? "success" : "muted"}>{f.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{f.category}</TableCell>
                  <TableCell className="max-w-sm truncate text-xs text-muted-foreground">{f.notes ?? "—"}</TableCell>
                  <TableCell
                    className={
                      "text-right font-medium tabular-nums " +
                      (f.type === "income" ? "text-[hsl(var(--success))]" : "")
                    }
                  >
                    {f.type === "income" ? "+" : "−"}
                    {formatCurrency(f.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <FinanceDialog entry={f} />
                      <FinanceDelete id={f.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
