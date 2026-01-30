const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.0-flash-001";

interface CategorizeResult {
  category: string;
  confidence: number;
  merchant: string | null;
}

interface ReceiptData {
  merchant: string | null;
  date: string | null;
  total: number | null;
  currency: string | null;
  items: Array<{
    name: string;
    amount: number;
    quantity: number;
    category: string | null;
  }>;
  tax: number | null;
  tip: number | null;
}

interface RecategorizeResult {
  category: string;
  confidence: number;
}

async function callOpenRouter<T>(
  messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }>,
): Promise<T> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://dapfinance.app",
      "X-Title": "DAPFinance",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenRouter");
  }

  return JSON.parse(content) as T;
}

export async function categorizeTransaction(
  description: string,
  amount: number,
  currency: string,
  date: string,
): Promise<CategorizeResult> {
  try {
    return await callOpenRouter<CategorizeResult>([
      {
        role: "system",
        content: `You are a financial transaction categorizer. Given a transaction, return JSON with:
- "category": one of: housing, transportation, food_dining, groceries, utilities, healthcare, entertainment, shopping, travel, education, personal_care, income, transfer, investment, subscription, fees, other
- "confidence": 0-1 float
- "merchant": cleaned merchant name or null`,
      },
      {
        role: "user",
        content: `Categorize: "${description}", amount: ${amount} ${currency}, date: ${date}`,
      },
    ]);
  } catch (error) {
    console.error("categorizeTransaction failed:", error);
    return { category: "other", confidence: 0, merchant: null };
  }
}

export async function extractReceipt(imageUrl: string): Promise<ReceiptData> {
  try {
    return await callOpenRouter<ReceiptData>([
      {
        role: "system",
        content: `You extract structured data from receipt images. Return JSON with:
- "merchant": string or null
- "date": ISO date string or null
- "total": number or null
- "currency": 3-letter code or null
- "items": array of {name, amount, quantity, category}
- "tax": number or null
- "tip": number or null`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract all data from this receipt:" },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ]);
  } catch (error) {
    console.error("extractReceipt failed:", error);
    return {
      merchant: null,
      date: null,
      total: null,
      currency: null,
      items: [],
      tax: null,
      tip: null,
    };
  }
}

export async function recategorize(
  description: string,
  amount: number,
  note: string | null,
  extractedData: Record<string, unknown> | null,
): Promise<RecategorizeResult> {
  try {
    const context = [
      `Description: "${description}"`,
      `Amount: ${amount}`,
      note ? `Note: "${note}"` : null,
      extractedData ? `Extracted data: ${JSON.stringify(extractedData)}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return await callOpenRouter<RecategorizeResult>([
      {
        role: "system",
        content: `You re-categorize financial transactions with additional context. Return JSON with:
- "category": one of: housing, transportation, food_dining, groceries, utilities, healthcare, entertainment, shopping, travel, education, personal_care, income, transfer, investment, subscription, fees, other
- "confidence": 0-1 float`,
      },
      {
        role: "user",
        content: `Re-categorize with this context:\n${context}`,
      },
    ]);
  } catch (error) {
    console.error("recategorize failed:", error);
    return { category: "other", confidence: 0 };
  }
}
