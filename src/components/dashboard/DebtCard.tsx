"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

export default function DebtCard({ amount }: { amount: number }) {
  if (amount <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-2xl border border-red-500/10 bg-[#111827]/60 p-4 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
            Andrew Debt
          </p>
          <p className="mt-1 text-lg font-bold text-red-400">
            {formatCurrency(amount)}
          </p>
        </div>
        <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-medium text-red-400">
          Lease ends Jul 12
        </span>
      </div>
    </motion.div>
  );
}
