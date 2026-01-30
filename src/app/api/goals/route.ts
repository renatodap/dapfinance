import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const CreateGoalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  currentAmount: z.number().default(0),
  targetDate: z.string().datetime().optional(),
});

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: goals });
  } catch (error) {
    console.error("[api/goals] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateGoalSchema.parse(body);

    const goal = await prisma.goal.create({
      data: {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
      },
    });

    return NextResponse.json({ data: goal }, { status: 201 });
  } catch (error) {
    console.error("[api/goals] POST error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
