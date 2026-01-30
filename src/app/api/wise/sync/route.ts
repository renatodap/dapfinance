import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const WISE_API_TOKEN = process.env.WISE_API_TOKEN ?? "";
const WISE_PROFILE_ID = process.env.WISE_PROFILE_ID ?? "";
const WISE_API_BASE = "https://api.transferwise.com";

export async function POST() {
  if (!WISE_API_TOKEN || !WISE_PROFILE_ID) {
    return NextResponse.json(
      { error: "Wise API credentials not configured. Set WISE_API_TOKEN and WISE_PROFILE_ID." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${WISE_API_BASE}/v4/profiles/${WISE_PROFILE_ID}/balances?types=STANDARD`,
      {
        headers: { Authorization: `Bearer ${WISE_API_TOKEN}` },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("[api/wise/sync] Wise API error:", text);
      return NextResponse.json({ error: "Wise API request failed" }, { status: 502 });
    }

    const balances = await res.json();
    let count = 0;

    for (const balance of balances) {
      const currency = balance.currency;
      const amount = balance.amount?.value ?? 0;

      await prisma.account.updateMany({
        where: {
          institution: { contains: "Wise", mode: "insensitive" },
          currency,
        },
        data: {
          currentBalance: amount,
          lastSyncedAt: new Date(),
        },
      });
      count++;
    }

    return NextResponse.json({ data: { count, balances: balances.length } });
  } catch (error) {
    console.error("[api/wise/sync] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
