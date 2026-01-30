import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const BulkApproveSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = BulkApproveSchema.parse(body);

    const result = await prisma.transaction.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "reviewed",
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ data: { updated: result.count } });
  } catch (error) {
    console.error("[api/transactions/bulk-approve] POST error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
