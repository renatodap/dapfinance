import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parse } from "csv-parse/sync";

interface CsvRow {
  date: string;
  description: string;
  amount: string;
  [key: string]: string;
}

function parseBoa(rows: CsvRow[]) {
  return rows.map((row) => ({
    date: new Date(row["Date"] || row["date"]),
    description: (row["Description"] || row["description"] || "").trim(),
    amount: parseFloat((row["Amount"] || row["amount"] || "0").replace(/[,$]/g, "")),
    currency: "USD",
  }));
}

function parseFidelity(rows: CsvRow[]) {
  return rows.map((row) => ({
    date: new Date(row["Date"] || row["date"]),
    description: (row["Description"] || row["Memo"] || row["description"] || "").trim(),
    amount: parseFloat((row["Amount"] || row["amount"] || "0").replace(/[,$]/g, "")),
    currency: "USD",
  }));
}

const parsers: Record<string, (rows: CsvRow[]) => Array<{ date: Date; description: string; amount: number; currency: string }>> = {
  boa: parseBoa,
  fidelity: parseFidelity,
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bank: string }> }
) {
  try {
    const { bank } = await params;
    const parserFn = parsers[bank];

    if (!parserFn) {
      return NextResponse.json({ error: `Unsupported bank: ${bank}` }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No CSV file provided" }, { status: 400 });
    }

    const text = await file.text();
    const rows = parse(text, { columns: true, skip_empty_lines: true }) as CsvRow[];
    const parsed = parserFn(rows);

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const entry of parsed) {
      try {
        const dedupeKey = `${bank}-${entry.date.toISOString()}-${entry.amount}-${entry.description.slice(0, 50)}`;

        const existing = await prisma.transaction.findFirst({
          where: { dedupeKey },
        });

        if (existing) {
          skipped++;
          continue;
        }

        let category = "uncategorized";
        try {
          const { categorizeTransaction } = await import("@/lib/ai");
          const result = await categorizeTransaction(entry.description, entry.amount, entry.currency, entry.date.toISOString());
          category = result.category;
        } catch {
          // AI failed, use default
        }

        await prisma.transaction.create({
          data: {
            description: entry.description,
            amount: entry.amount,
            currency: entry.currency,
            date: entry.date,
            category,
            source: bank,
            dedupeKey,
            status: "pending",
            accountId: "",
          },
        });

        imported++;
      } catch (err) {
        errors.push(`Row error: ${entry.description} - ${err}`);
      }
    }

    return NextResponse.json({ data: { imported, skipped, errors } });
  } catch (error) {
    console.error("[api/import/[bank]] POST error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
