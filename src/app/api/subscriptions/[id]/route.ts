import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const UpdateSubscriptionSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().optional(),
  frequency: z.enum(["monthly", "yearly", "weekly"]).optional(),
  category: z.string().optional(),
  nextBillingDate: z.string().datetime().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updates = UpdateSubscriptionSchema.parse(body);

    const data: Record<string, unknown> = { ...updates };
    if (updates.nextBillingDate) {
      data.nextBillingDate = new Date(updates.nextBillingDate);
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data,
    });

    return NextResponse.json({ data: subscription });
  } catch (error) {
    console.error("[api/subscriptions/[id]] PATCH error:", error);
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

    await prisma.subscription.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("[api/subscriptions/[id]] DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
