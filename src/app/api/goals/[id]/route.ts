import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const UpdateGoalSchema = z.object({
  name: z.string().min(1).optional(),
  currentAmount: z.number().optional(),
  targetAmount: z.number().positive().optional(),
  deadline: z.string().datetime().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updates = UpdateGoalSchema.parse(body);

    const data: Record<string, unknown> = { ...updates };
    if (updates.deadline) {
      data.deadline = new Date(updates.deadline);
    }

    const goal = await prisma.goal.update({
      where: { id },
      data,
    });

    return NextResponse.json({ data: goal });
  } catch (error) {
    console.error("[api/goals/[id]] PATCH error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.goal.delete({ where: { id } });

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("[api/goals/[id]] DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
