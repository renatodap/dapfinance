import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ExtractReceiptSchema = z.object({
  imageUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = ExtractReceiptSchema.parse(body);

    const { extractReceipt } = await import("@/lib/ai");
    const result = await extractReceipt(imageUrl);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("[api/ai/extract-receipt] POST error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Receipt extraction failed" }, { status: 500 });
  }
}
