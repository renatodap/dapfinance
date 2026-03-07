import { NextResponse, type NextRequest } from "next/server";
import { supabase, USER_ID } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // YYYY-MM
  const category = searchParams.get("category");
  const account = searchParams.get("account");
  const type = searchParams.get("type"); // expense, income, transfer
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    let query = supabase
      .from("finance_transactions")
      .select("id, transaction_date, description, merchant, amount, tx_type, source, external_id, category_id, account_id, finance_categories(name, icon), finance_accounts!inner(name, currency)", { count: "exact" })
      .eq("user_id", USER_ID)
      .order("transaction_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (month) {
      const parts = month.split("-").map(Number);
      const y = parts[0] ?? 2026;
      const m = parts[1] ?? 1;
      const start = `${y}-${String(m).padStart(2, "0")}-01`;
      const end = new Date(y, m, 0).toISOString().split("T")[0]; // last day
      query = query.gte("transaction_date", start).lte("transaction_date", end);
    }

    if (category) {
      query = query.eq("category_id", category);
    }

    if (account) {
      query = query.eq("account_id", account);
    }

    if (type) {
      query = query.eq("tx_type", type);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Also fetch filter options
    const [categoriesRes, accountsRes] = await Promise.all([
      supabase
        .from("finance_categories")
        .select("id, name")
        .eq("user_id", USER_ID)
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("finance_accounts")
        .select("id, name, currency")
        .eq("user_id", USER_ID)
        .eq("is_active", true),
    ]);

    return NextResponse.json({
      transactions: (data || []).map((t: any) => ({
        id: t.id,
        date: t.transaction_date,
        description: t.description,
        merchant: t.merchant,
        amount: Number(t.amount),
        type: t.tx_type,
        source: t.source,
        category: t.finance_categories?.name || null,
        categoryIcon: t.finance_categories?.icon || null,
        account: t.finance_accounts?.name || null,
        currency: t.finance_accounts?.currency || "USD",
      })),
      total: count || 0,
      categories: categoriesRes.data || [],
      accounts: accountsRes.data || [],
    });
  } catch (error) {
    console.error("Transactions error:", error);
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 });
  }
}
