"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export interface Transaction {
  id: string;
  description: string;
  merchantName?: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  status: "pending" | "reviewed" | "auto";
}

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
}

const statusDot: Record<Transaction["status"], string> = {
  pending: "bg-amber-400",
  reviewed: "bg-emerald-400",
  auto: "bg-teal-400",
};

export function TransactionList({ transactions, onTransactionClick }: TransactionListProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of transactions) {
      const key = tx.date.slice(0, 10);
      const arr = map.get(key) ?? [];
      arr.push(tx);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [transactions]);

  return (
    <div className="space-y-1">
      {grouped.map(([dateKey, items]) => (
        <div key={dateKey}>
          <div className="sticky top-0 z-10 bg-[#0A0E1A]/90 backdrop-blur-sm px-1 py-2">
            <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
              {formatDate(dateKey)}
            </span>
          </div>

          <div className="space-y-1.5">
            {items.map((tx, i) => {
              const isNeg = tx.amount < 0;
              return (
                <motion.button
                  key={tx.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onTransactionClick(tx)}
                  className="w-full text-left rounded-xl border border-white/[0.06] bg-[#1A1F2E]/60 backdrop-blur-lg p-3.5 flex items-center gap-3 hover:border-white/[0.12] transition-colors"
                >
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", statusDot[tx.status])} />

                  <div className="min-w-0 flex-1">
                    <p className="text-[#F9FAFB] text-sm font-medium truncate">
                      {tx.merchantName || tx.description}
                    </p>
                    <span className="inline-flex items-center rounded-full bg-[#111827]/60 border border-white/[0.06] px-2 py-0.5 text-[10px] text-[#9CA3AF] mt-1">
                      {tx.category}
                    </span>
                  </div>

                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums whitespace-nowrap",
                      isNeg ? "text-red-400" : "text-emerald-400"
                    )}
                  >
                    {formatCurrency(tx.amount, tx.currency)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      {transactions.length === 0 && (
        <p className="text-center text-[#6B7280] text-sm py-12">No transactions found.</p>
      )}
    </div>
  );
}
