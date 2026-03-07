"use client";

import { motion } from "framer-motion";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

interface Transaction {
  id: string;
  transaction_date: string;
  description: string;
  merchant: string | null;
  amount: number;
  tx_type: string;
  currency: string;
  category_name: string | null;
}

export default function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="rounded-2xl border border-white/5 bg-[#111827]/60 p-5 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#9CA3AF]">
          Recent Activity
        </h2>
        <Link
          href="/transactions"
          className="text-xs font-medium text-[#D4A853] hover:text-[#E8C97A]"
        >
          See all
        </Link>
      </div>

      <div className="mt-3 divide-y divide-white/5">
        {transactions.slice(0, 8).map((tx) => (
          <div key={tx.id} className="flex items-center justify-between py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">
                {tx.merchant || tx.description}
              </p>
              <p className="text-[10px] text-[#6B7280]">
                {tx.category_name || "Uncategorized"} · {formatDate(tx.transaction_date)}
              </p>
            </div>
            <span
              className={`ml-3 text-sm font-semibold ${
                tx.tx_type === "income" ? "text-emerald-400" : "text-white"
              }`}
            >
              {tx.tx_type === "income" ? "+" : "-"}
              {formatCurrency(Math.abs(tx.amount), tx.currency)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
