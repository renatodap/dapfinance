import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const CATEGORY_COLORS: Record<string, string> = {
  housing: "#D4A853",
  transportation: "#2DD4BF",
  food_dining: "#F59E0B",
  groceries: "#10B981",
  utilities: "#6366F1",
  healthcare: "#EF4444",
  entertainment: "#EC4899",
  shopping: "#8B5CF6",
  travel: "#06B6D4",
  education: "#3B82F6",
  personal_care: "#F472B6",
  income: "#22C55E",
  transfer: "#94A3B8",
  investment: "#14B8A6",
  subscription: "#A855F7",
  fees: "#EF4444",
  other: "#6B7280",
  uncategorized: "#4B5563",
};

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      accounts,
      pendingCount,
      subscriptions,
      goals,
      snapshots,
      monthlyTransactions,
    ] = await Promise.all([
      prisma.account.findMany(),
      prisma.transaction.count({ where: { status: "pending" } }),
      prisma.subscription.findMany({ where: { active: true } }),
      prisma.goal.findMany(),
      prisma.monthlySnapshot.findMany({
        orderBy: { month: "desc" },
        take: 6,
      }),
      prisma.transaction.findMany({
        where: {
          date: { gte: startOfMonth },
          amount: { lt: 0 },
          status: { not: "excluded" },
        },
        select: { category: true, amount: true },
      }),
    ]);

    const netWorthAmount = accounts.reduce((sum, a) => sum + Number(a.currentBalance ?? 0), 0);
    const subscriptionTotal = subscriptions.reduce((sum, s) => sum + Number(s.amount), 0);

    // Build spending by category array
    const spendingMap: Record<string, number> = {};
    for (const t of monthlyTransactions) {
      const cat = t.category ?? "uncategorized";
      spendingMap[cat] = (spendingMap[cat] ?? 0) + Math.abs(Number(t.amount));
    }
    const spending = Object.entries(spendingMap).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] ?? "#6B7280",
    }));

    // Calculate change from previous month's snapshot
    const previousNetWorth = snapshots.length > 0 ? Number(snapshots[0].totalUsd ?? 0) : 0;
    const change = previousNetWorth > 0 ? netWorthAmount - previousNetWorth : 0;
    const changePercent = previousNetWorth > 0 ? (change / previousNetWorth) * 100 : 0;

    // Build sparkline from snapshots
    const sparklineData = snapshots
      .reverse()
      .map((s) => ({ value: Number(s.totalUsd ?? 0) }));

    return NextResponse.json({
      data: {
        netWorth: {
          amount: netWorthAmount,
          change,
          changePercent,
          sparklineData,
        },
        pendingCount,
        spending,
        accounts: accounts.map((a) => ({
          id: a.id,
          name: a.name,
          institution: a.institution,
          currency: a.currency,
          currentBalance: Number(a.currentBalance ?? 0),
          lastSyncedAt: a.lastSyncedAt?.toISOString() ?? null,
        })),
        subscriptions: {
          items: subscriptions.map((s) => ({
            id: s.id,
            name: s.name,
            amount: Number(s.amount),
            nextChargeDate: s.billingDay
              ? new Date(now.getFullYear(), now.getMonth(), s.billingDay).toISOString()
              : null,
          })),
          totalMonthly: subscriptionTotal,
        },
        goals: goals.map((g) => ({
          id: g.id,
          name: g.name,
          targetAmount: Number(g.targetAmount),
          currentAmount: Number(g.currentAmount),
          targetDate: g.targetDate?.toISOString() ?? null,
        })),
      },
    });
  } catch (error) {
    console.error("[api/dashboard] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
