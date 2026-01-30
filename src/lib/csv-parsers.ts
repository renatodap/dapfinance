interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  category: string | null;
  reference: string | null;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i]!;
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

export function parseBankOfAmericaCSV(csv: string): ParsedTransaction[] {
  const lines = csv.trim().split("\n");
  const transactions: ParsedTransaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line) continue;

    const fields = parseCSVLine(line);
    const [date, description, amount, reference] = fields;

    if (!date || !description || !amount) continue;

    const parsedAmount = parseFloat(amount.replace(/[$,]/g, ""));
    if (isNaN(parsedAmount)) continue;

    transactions.push({
      date: normalizeDate(date),
      description: description.trim(),
      amount: parsedAmount,
      category: null,
      reference: reference?.trim() ?? null,
    });
  }

  return transactions;
}

export function parseFidelityCSV(csv: string): ParsedTransaction[] {
  const lines = csv.trim().split("\n");
  const transactions: ParsedTransaction[] = [];

  if (lines.length < 2) return transactions;

  const header = parseCSVLine(lines[0]!);
  const dateIdx = header.findIndex((h) => /date/i.test(h));
  const descIdx = header.findIndex((h) => /description|transaction/i.test(h));
  const amountIdx = header.findIndex((h) => /amount/i.test(h));

  if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) {
    throw new Error("Fidelity CSV: could not find required columns");
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line) continue;

    const fields = parseCSVLine(line);
    const date = fields[dateIdx];
    const description = fields[descIdx];
    const amountStr = fields[amountIdx];

    if (!date || !description || !amountStr) continue;

    const parsedAmount = parseFloat(amountStr.replace(/[$,]/g, ""));
    if (isNaN(parsedAmount)) continue;

    transactions.push({
      date: normalizeDate(date),
      description: description.trim(),
      amount: parsedAmount,
      category: null,
      reference: null,
    });
  }

  return transactions;
}

function normalizeDate(dateStr: string): string {
  const cleaned = dateStr.replace(/"/g, "").trim();

  // MM/DD/YYYY
  const slashMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, m, d, y] = slashMatch;
    return `${y}-${m!.padStart(2, "0")}-${d!.padStart(2, "0")}`;
  }

  // YYYY-MM-DD already
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  // Fallback: try Date parse
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return cleaned;
}
