import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CategorizeSchema = z.object({
  description: z.string().min(1),
  amount: z.number(),
  currency: z.string().default("USD"),
  date: z.string().default(() => new Date().toISOString()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, amount, currency, date } = CategorizeSchema.parse(body);

    const { categorizeTransaction } = await import("@/lib/ai");
    const result = await categorizeTransaction(description, amount, currency, date);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("[api/ai/categorize] POST error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Categorization failed" }, { status: 500 });
  }
}
