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
