import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: "desc" },
      include: { account: { select: { name: true } } },
    });

    const header = "Date,Description,Merchant,Amount,Currency,Category,Status,Account,Note\n";
    const rows = transactions.map((t) => {
      const cols = [
        t.date.toISOString().slice(0, 10),
        `"${(t.description ?? "").replace(/"/g, '""')}"`,
        `"${(t.merchantName ?? "").replace(/"/g, '""')}"`,
        Number(t.amount).toFixed(2),
        t.currency,
        t.category ?? "",
        t.status,
        t.account.name,
        `"${(t.note ?? "").replace(/"/g, '""')}"`,
      ];
      return cols.join(",");
    });

    const csv = header + rows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="dapfinance-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("[api/export] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
