import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/wise";

interface WiseBalancePayload {
  data: {
    resource: {
      id: number;
      profile_id: number;
      type: string;
    };
    amount: number;
    currency: string;
    description: string;
    date: string;
    referenceNumber?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("X-Signature-SHA256");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload: WiseBalancePayload = JSON.parse(rawBody);
    const { data } = payload;

    const dedupeKey = `wise-${data.resource.id}-${data.amount}-${data.date}`;

    const existing = await prisma.transaction.findFirst({
      where: { dedupeKey },
    });

    if (existing) {
      return NextResponse.json({ data: { message: "Duplicate, skipped" } });
    }

    // Find the Wise account by institution
    const account = await prisma.account.findFirst({
      where: { institution: "wise", currency: data.currency },
    });

    // AI categorization
    let category = "uncategorized";
    try {
      const { categorizeTransaction } = await import("@/lib/ai");
      const result = await categorizeTransaction(data.description, data.amount, data.currency, data.date);
      category = result.category;
    } catch {
      console.error("[api/webhooks/wise] AI categorization failed, using default");
    }

    const transaction = await prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        date: new Date(data.date),
        category,
        source: "wise",
        dedupeKey,
        status: "pending",
        accountId: account?.id ?? "",
      },
    });

    // Update account balance if account exists
    if (account) {
      await prisma.account.update({
        where: { id: account.id },
        data: { currentBalance: { increment: data.amount } },
      });

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { accountId: account.id },
      });
    }

    return NextResponse.json({ data: { received: true, transactionId: transaction.id } });
  } catch (error) {
    console.error("[api/webhooks/wise] Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
