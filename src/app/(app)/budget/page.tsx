"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface BudgetCategory {
  name: string;
  category_type: string;
  monthly_budget: number;
  spent: number;
  remaining: number;
  tx_count: number;
}


export default function BudgetPage() {
  const [data, setData] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((json) => {
        setData(
          json.budget.map((b: any) => ({
            name: b.name,
            category_type: "want",
            monthly_budget: b.budget,
            spent: b.value,
            remaining: b.remaining,
            tx_count: 0,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalBudget = data.reduce((s, d) => s + d.monthly_budget, 0);
  const totalSpent = data.reduce((s, d) => s + d.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const monthPct = Math.round((dayOfMonth / daysInMonth) * 100);
  const spendPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-3 pb-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-[#111827]/60" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold text-white">Budget</h1>

      {/* Overview card */}
      <div className="rounded-2xl border border-[#D4A853]/10 bg-[#111827]/60 p-5 backdrop-blur-xl">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-[#6B7280]">
              {now.toLocaleDateString("en-US", { month: "long" })} — Day {dayOfMonth}/{daysInMonth}
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              {formatCurrency(totalRemaining)}
            </p>
            <p className="text-xs text-[#6B7280]">remaining of {formatCurrency(totalBudget)}</p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${spendPct > monthPct ? "text-red-400" : "text-emerald-400"}`}>
              {spendPct}%
            </p>
            <p className="text-[10px] text-[#6B7280]">
              {spendPct > monthPct ? "Ahead of pace" : "On track"}
            </p>
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
          <div className="relative h-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(spendPct, 100)}%` }}
              transition={{ duration: 0.8 }}
              className="absolute h-full rounded-full bg-[#D4A853]"
            />
            <div
              className="absolute h-full w-0.5 bg-white/30"
              style={{ left: `${monthPct}%` }}
            />
          </div>
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-[#6B7280]">
          <span>{formatCurrency(totalSpent)} spent</span>
          <span>Day {dayOfMonth} marker</span>
        </div>
      </div>

      {/* Category cards */}
      <div className="space-y-2">
        {data.map((cat, i) => {
          const pct = cat.monthly_budget > 0 ? (cat.spent / cat.monthly_budget) * 100 : 0;
          const isOver = cat.spent > cat.monthly_budget;

          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/5 bg-[#111827]/60 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{cat.name}</span>
                <span className={`text-sm font-bold ${isOver ? "text-red-400" : "text-[#D4A853]"}`}>
                  {formatCurrency(cat.remaining)}
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: isOver ? "#F87171" : "#D4A853" }}
                />
              </div>

              <div className="mt-1 flex justify-between text-[10px] text-[#6B7280]">
                <span>{formatCurrency(cat.spent)} spent</span>
                <span>{formatCurrency(cat.monthly_budget)} budget</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
