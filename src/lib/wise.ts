import crypto from "node:crypto";

const WISE_PUBLIC_KEY_PEM = process.env.WISE_PUBLIC_KEY ?? "";

export function verifyWebhookSignature(
  payload: string,
  signatureHeader: string,
): boolean {
  if (!WISE_PUBLIC_KEY_PEM) {
    throw new Error("WISE_PUBLIC_KEY is not configured");
  }

  try {
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(payload);
    verifier.end();

    const signatureBuffer = Buffer.from(signatureHeader, "base64");
    return verifier.verify(WISE_PUBLIC_KEY_PEM, signatureBuffer);
  } catch (error) {
    console.error("Wise webhook signature verification failed:", error);
    return false;
  }
}

export function parseWiseWebhookPayload(body: string): {
  event_type: string;
  data: Record<string, unknown>;
  schema_version: string;
  sent_at: string;
} {
  return JSON.parse(body);
}

const WISE_API_TOKEN = process.env.WISE_API_TOKEN ?? "";
const WISE_PROFILE_ID = process.env.WISE_PROFILE_ID ?? "";
const WISE_API_BASE = "https://api.transferwise.com";

export async function fetchWiseBalances() {
  if (!WISE_API_TOKEN || !WISE_PROFILE_ID) {
    throw new Error("Wise API credentials not configured");
  }

  const res = await fetch(
    `${WISE_API_BASE}/v4/profiles/${WISE_PROFILE_ID}/balances?types=STANDARD`,
    { headers: { Authorization: `Bearer ${WISE_API_TOKEN}` } }
  );

  if (!res.ok) throw new Error(`Wise API error: ${res.status}`);
  return res.json();
}

export async function fetchWiseTransactions(
  currency: string,
  since: Date
): Promise<Record<string, unknown>[]> {
  if (!WISE_API_TOKEN || !WISE_PROFILE_ID) {
    throw new Error("Wise API credentials not configured");
  }

  const intervalStart = since.toISOString();
  const intervalEnd = new Date().toISOString();

  const res = await fetch(
    `${WISE_API_BASE}/v3/profiles/${WISE_PROFILE_ID}/borderless-accounts/statement?currency=${currency}&intervalStart=${intervalStart}&intervalEnd=${intervalEnd}&type=COMPACT`,
    { headers: { Authorization: `Bearer ${WISE_API_TOKEN}` } }
  );

  if (!res.ok) throw new Error(`Wise API error: ${res.status}`);
  const data = await res.json();
  return data.transactions ?? [];
}
