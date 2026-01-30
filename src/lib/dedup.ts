import crypto from "node:crypto";
import { prisma } from "./prisma";

export function generateDedupeKey(parts: {
  accountId: string;
  externalId?: string | null;
  amount: number | string;
  date: string;
  description: string;
  source: string;
}): string {
  if (parts.externalId) {
    return `${parts.source}:${parts.accountId}:${parts.externalId}`;
  }

  const raw = [
    parts.accountId,
    String(parts.amount),
    parts.date,
    parts.description.toLowerCase().trim(),
    parts.source,
  ].join("|");

  const hash = crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
  return `${parts.source}:${parts.accountId}:${hash}`;
}

export async function findDuplicate(
  dedupeKey: string,
): Promise<{ id: string } | null> {
  const existing = await prisma.transaction.findUnique({
    where: { dedupeKey },
    select: { id: true },
  });
  return existing;
}
