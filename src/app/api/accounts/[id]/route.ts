import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const UpdateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  currentBalance: z.number().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({ data: account });
  } catch (error) {
    console.error("[api/accounts/[id]] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updates = UpdateAccountSchema.parse(body);

    const account = await prisma.account.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ data: account });
  } catch (error) {
    console.error("[api/accounts/[id]] PATCH error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
