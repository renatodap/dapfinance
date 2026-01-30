import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      accounts,
      pendingCount,
      recentTransactions,
      subscriptions,
      goals,
      snapshots,
      monthlyTransactions,
    ] = await Promise.all([
      prisma.account.findMany(),
      prisma.transaction.count({ where: { status: "pending" } }),
      prisma.transaction.findMany({
        orderBy: { date: "desc" },
        take: 5,
      }),
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

    const netWorth = accounts.reduce((sum, a) => sum + Number(a.currentBalance ?? 0), 0);
    const subscriptionTotal = subscriptions.reduce((sum, s) => sum + Number(s.amount), 0);

    const spendingByCategory: Record<string, number> = {};
    for (const t of monthlyTransactions) {
      const cat = t.category ?? "uncategorized";
      spendingByCategory[cat] = (spendingByCategory[cat] ?? 0) + Math.abs(Number(t.amount));
    }

    return NextResponse.json({
      data: {
        netWorth,
        pendingCount,
        spendingByCategory,
        recentTransactions,
        subscriptionTotal,
        goals,
        snapshots,
      },
    });
  } catch (error) {
    console.error("[api/dashboard] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
