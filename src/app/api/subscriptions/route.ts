import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const CreateSubscriptionSchema = z.object({
  name: z.string().min(1),
  amount: z.number(),
  currency: z.string().default("USD"),
  frequency: z.enum(["monthly", "yearly", "weekly"]),
  category: z.string().optional(),
  nextBillingDate: z.string().datetime().optional(),
});

export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: subscriptions });
  } catch (error) {
    console.error("[api/subscriptions] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateSubscriptionSchema.parse(body);

    const subscription = await prisma.subscription.create({
      data: {
        ...data,
        active: true,
        nextBillingDate: data.nextBillingDate ? new Date(data.nextBillingDate) : null,
      },
    });

    return NextResponse.json({ data: subscription }, { status: 201 });
  } catch (error) {
    console.error("[api/subscriptions] POST error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
