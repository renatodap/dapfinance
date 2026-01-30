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

    // Try uploading to R2 if configured, otherwise skip storage
    const key = `receipts/${id}/${Date.now()}-${file.name}`;
    let storagePath: string | null = null;

    try {
      const { uploadFile } = await import("@/lib/r2");
      storagePath = await uploadFile(key, buffer, file.type);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "R2_NOT_CONFIGURED") {
        console.warn("[api/transactions/[id]/photos] R2 not configured, skipping upload");
      } else {
        console.error("[api/transactions/[id]/photos] R2 upload failed:", msg);
      }
    }

    // Extract receipt data via AI regardless of R2 status
    let extractedData: Record<string, unknown> | null = null;
    if (extractReceipt) {
      try {
        // Convert image to base64 data URL for AI processing (works without R2)
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${file.type};base64,${base64}`;
        const { extractReceipt: extract } = await import("@/lib/ai");
        extractedData = (await extract(dataUrl)) as unknown as Record<string, unknown>;
      } catch {
        console.error("[api/transactions/[id]/photos] Receipt extraction failed");
      }
    }

    // Save photo record if we have storage or extracted data
    if (storagePath || extractedData) {
      const photo = await prisma.transactionPhoto.create({
        data: {
          transactionId: id,
          storagePath: storagePath ?? `local:${key}`,
          extractedData: extractedData ? JSON.parse(JSON.stringify(extractedData)) : undefined,
          extractionModel: extractReceipt ? "google/gemini-2.0-flash-001" : undefined,
        },
      });

      return NextResponse.json({ data: { photo, extractedData } }, { status: 201 });
    }

    return NextResponse.json({
      data: { extractedData },
      warning: "R2 not configured — image was not stored",
    });
  } catch (error) {
    console.error("[api/transactions/[id]/photos] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
