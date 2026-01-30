import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const accounts = await prisma.account.findMany();

    let usdToBrl = 1;
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const rateData = await res.json();
      usdToBrl = rateData.rates?.BRL ?? 1;
    } catch {
      console.error("[api/snapshots/cron] Failed to fetch exchange rate");
    }

    const now = new Date();
    const month = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));

    const balances: Record<string, number> = {};
    let totalUsd = 0;

    for (const account of accounts) {
      const bal = Number(account.currentBalance ?? 0);
      balances[account.id] = bal;
      if (account.currency === "USD") {
        totalUsd += bal;
      } else if (account.currency === "BRL") {
        totalUsd += bal / usdToBrl;
      } else {
        totalUsd += bal;
      }
    }

    const snapshot = await prisma.monthlySnapshot.upsert({
      where: { month },
      create: {
        month,
        netWorthUsd: totalUsd,
        exchangeRate: usdToBrl,
        accountBalances: balances,
      },
      update: {
        netWorthUsd: totalUsd,
        exchangeRate: usdToBrl,
        accountBalances: balances,
      },
    });

    return NextResponse.json({ data: snapshot });
  } catch (error) {
    console.error("[api/snapshots/cron] POST error:", error);
    return NextResponse.json({ error: "Snapshot creation failed" }, { status: 500 });
  }
}
