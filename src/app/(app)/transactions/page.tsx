"use client";

import { useEffect, useState, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Transaction {
  id: string;
  date: string;
  description: string;
  merchant: string | null;
  amount: number;
  type: string;
  source: string;
  category: string | null;
  account: string | null;
  currency: string;
}

interface FilterOption {
  id: string;
  name: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [_accounts, setAccounts] = useState<FilterOption[]>([]);

  // Filters
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (category) params.set("category", category);
    if (type) params.set("type", type);
    params.set("limit", "100");

    try {
      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
      setTotal(data.total || 0);
      setCategories(data.categories || []);
      setAccounts(data.accounts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [month, category, type]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Group transactions by date
  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const key = tx.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  const monthTotal = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white">Activity</h1>
        <p className="text-xs text-[#6B7280]">{total} transactions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#111827] px-3 py-1.5 text-xs text-white outline-none focus:border-[#D4A853]/50"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#111827] px-3 py-1.5 text-xs text-white outline-none focus:border-[#D4A853]/50"
        >
          <option value="">All types</option>
          <option value="expense">Expenses</option>
          <option value="income">Income</option>
          <option value="transfer">Transfers</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#111827] px-3 py-1.5 text-xs text-white outline-none focus:border-[#D4A853]/50"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Month total */}
      <div className="rounded-xl border border-white/5 bg-[#111827]/60 px-4 py-3">
        <span className="text-xs text-[#6B7280]">Month total: </span>
        <span className="text-sm font-bold text-[#D4A853]">{formatCurrency(monthTotal)}</span>
      </div>

      {/* Transaction list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[#111827]/60" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[#6B7280]">
                {formatDate(date)}
              </p>
              <div className="divide-y divide-white/5 rounded-xl border border-white/5 bg-[#111827]/60">
                {txs.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">
                        {tx.merchant || tx.description}
                      </p>
                      <p className="text-[10px] text-[#6B7280]">
                        {tx.category || "Uncategorized"} · {tx.account}
                      </p>
                    </div>
                    <span
                      className={`ml-3 whitespace-nowrap text-sm font-semibold ${
                        tx.type === "income"
                          ? "text-emerald-400"
                          : tx.type === "transfer"
                          ? "text-[#6B7280]"
                          : "text-white"
                      }`}
                    >
                      {tx.type === "income" ? "+" : tx.type === "transfer" ? "" : "-"}
                      {formatCurrency(Math.abs(tx.amount), tx.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <p className="py-8 text-center text-sm text-[#6B7280]">No transactions found</p>
          )}
        </div>
      )}
    </div>
  );
}
