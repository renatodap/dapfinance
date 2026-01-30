import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["pending", "reviewed", "excluded"]).optional(),
  category: z.string().optional(),
  accountId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

const CreateTransactionSchema = z.object({
  description: z.string().min(1),
  amount: z.number(),
  currency: z.string().default("USD"),
  date: z.string().datetime(),
  category: z.string().optional(),
  accountId: z.string().optional(),
  note: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = QuerySchema.parse(params);
    const { page, limit, status, category, accountId, search, dateFrom, dateTo } = query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (accountId) where.accountId = accountId;
    if (search) {
      where.description = { contains: search, mode: "insensitive" };
    }
    if (dateFrom || dateTo) {
      where.date = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      data: transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[api/transactions] GET error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query parameters", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateTransactionSchema.parse(body);

    let category = data.category ?? "uncategorized";
    if (!data.category) {
      try {
        const { categorizeTransaction } = await import("@/lib/ai");
        const result = await categorizeTransaction(data.description, data.amount, data.currency, data.date);
        category = result.category;
      } catch {
        console.error("[api/transactions] AI categorization failed");
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        date: new Date(data.date),
        category,
        source: "manual",
        dedupeKey: `manual-${Date.now()}-${data.description.slice(0, 50)}`,
        status: "pending",
        note: data.note,
        tags: data.tags ?? [],
        accountId: data.accountId ?? "",
      },
    });

    return NextResponse.json({ data: transaction }, { status: 201 });
  } catch (error) {
    console.error("[api/transactions] POST error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
