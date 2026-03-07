"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface BudgetItem {
  name: string;
  value: number;
  budget: number;
  remaining: number;
  color: string;
}

export default function BudgetOverview({ data }: { data: BudgetItem[] }) {
  const totalSpent = data.reduce((s, d) => s + d.value, 0);
  const totalBudget = data.reduce((s, d) => s + d.budget, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl border border-white/5 bg-[#111827]/60 p-5 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#9CA3AF]">
          Budget
        </h2>
        <span className="text-xs text-[#6B7280]">
          {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {data.slice(0, 6).map((item) => {
          const pct = item.budget > 0 ? Math.min((item.value / item.budget) * 100, 100) : 0;
          const isOver = item.value > item.budget;

          return (
            <div key={item.name}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#E5E7EB]">{item.name}</span>
                <span className={isOver ? "text-red-400" : "text-[#9CA3AF]"}>
                  {formatCurrency(item.value)} / {formatCurrency(item.budget)}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: isOver ? "#F87171" : item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
