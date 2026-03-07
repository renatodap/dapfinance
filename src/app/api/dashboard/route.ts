import { NextResponse } from "next/server";
import { supabase, USER_ID } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [accountsRes, budgetRes, transactionsRes, debtRes, monthSummaryRes] = await Promise.all([
      supabase
        .from("finance_accounts")
        .select("id, name, account_type, currency, balance, updated_at")
        .eq("user_id", USER_ID)
        .eq("is_active", true)
        .order("balance", { ascending: false }),
      supabase
        .from("monthly_budget_status")
        .select("*")
        .not("monthly_budget", "is", null)
        .order("sort_order"),
      supabase
        .from("finance_transactions")
        .select("id, transaction_date, description, merchant, amount, tx_type, category_id, finance_categories(name, icon)")
        .eq("user_id", USER_ID)
        .order("transaction_date", { ascending: false })
        .limit(15),
      supabase
        .from("finance_debts")
        .select("amount")
        .eq("user_id", USER_ID)
        .eq("counterparty", "Andrew Leonard"),
      supabase
        .from("finance_transactions")
        .select("amount, tx_type")
        .eq("user_id", USER_ID)
        .gte("transaction_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]),
    ]);

    const accounts = accountsRes.data || [];
    const budget = budgetRes.data || [];
    const transactions = transactionsRes.data || [];
    const debtRows = debtRes.data || [];
    const monthTxs = monthSummaryRes.data || [];

    // Calculate total balance (USD accounts + BRL/5.5 estimate)
    const BRL_RATE = 5.5;
    const totalUsd = accounts.reduce((sum, a) => {
      const bal = Number(a.balance);
      return sum + (a.currency === "BRL" ? bal / BRL_RATE : bal);
    }, 0);

    // Andrew debt
    const andrewDebt = debtRows.reduce((sum, d) => sum + Number(d.amount), 0);

    // Month spending/income
    const monthSpent = monthTxs
      .filter((t) => t.tx_type === "expense")
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const monthIncome = monthTxs
      .filter((t) => t.tx_type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Spending by category for pie chart
    const COLORS = [
      "#D4A853", "#2DD4BF", "#818CF8", "#FB923C", "#F472B6",
      "#A78BFA", "#34D399", "#FBBF24", "#F87171", "#60A5FA",
    ];
    const spendingByCategory = budget.map((b, i) => ({
      name: b.name,
      value: Number(b.spent) || 0,
      budget: Number(b.monthly_budget),
      remaining: Number(b.remaining),
      color: COLORS[i % COLORS.length],
    }));

    return NextResponse.json({
      accounts,
      totalUsd,
      budget: spendingByCategory,
      transactions: transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        category_name: (t as any).finance_categories?.name || null,
        category_icon: (t as any).finance_categories?.icon || null,
      })),
      andrewDebt,
      monthSpent,
      monthIncome,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
