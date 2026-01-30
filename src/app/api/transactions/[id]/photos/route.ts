import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const extractReceipt = formData.get("extractReceipt") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to R2 via presigned URL
    const key = `receipts/${id}/${Date.now()}-${file.name}`;
    let url: string;

    try {
      const { uploadFile } = await import("@/lib/r2");
      url = await uploadFile(key, buffer, file.type);
    } catch {
      console.error("[api/transactions/[id]/photos] R2 upload failed");
      return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    }

    let extractedData: Record<string, unknown> | null = null;
    if (extractReceipt) {
      try {
        const { extractReceipt: extract } = await import("@/lib/ai");
        extractedData = (await extract(url)) as unknown as Record<string, unknown>;
      } catch {
        console.error("[api/transactions/[id]/photos] Receipt extraction failed");
      }
    }

    const photo = await prisma.transactionPhoto.create({
      data: {
        transactionId: id,
        storagePath: url,
        extractedData: extractedData ? JSON.parse(JSON.stringify(extractedData)) : undefined,
        extractionModel: extractReceipt ? "google/gemini-2.0-flash-001" : undefined,
      },
    });

    return NextResponse.json({ data: photo }, { status: 201 });
  } catch (error) {
    console.error("[api/transactions/[id]/photos] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
