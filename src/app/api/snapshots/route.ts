import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const snapshots = await prisma.monthlySnapshot.findMany({
      orderBy: { month: "desc" },
    });

    return NextResponse.json({ data: snapshots });
  } catch (error) {
    console.error("[api/snapshots] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
