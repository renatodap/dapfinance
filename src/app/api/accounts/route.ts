import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const CreateAccountSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  currency: z.string().default("USD"),
  institution: z.string().min(1),
  currentBalance: z.number().default(0),
});

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: accounts });
  } catch (error) {
    console.error("[api/accounts] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateAccountSchema.parse(body);

    const account = await prisma.account.create({ data });

    return NextResponse.json({ data: account }, { status: 201 });
  } catch (error) {
    console.error("[api/accounts] POST error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
