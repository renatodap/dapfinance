"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  nextChargeDate: string;
}

interface SubscriptionsSummaryProps {
  subscriptions: Subscription[];
  totalMonthly: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
};

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

export default function SubscriptionsSummary({
  subscriptions,
  totalMonthly,
}: SubscriptionsSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-white/5 bg-[#111827]/60 p-5 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#9CA3AF]">
          Subscriptions
        </h2>
        <span className="text-sm font-bold text-[#2DD4BF]">
          {formatCurrency(totalMonthly)}/mo
        </span>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-3 space-y-2"
      >
        {subscriptions.map((sub) => {
          const days = daysUntil(sub.nextChargeDate);
          return (
            <motion.div
              key={sub.id}
              variants={item}
              className="flex items-center justify-between rounded-lg bg-[#1A1F2E]/60 px-3 py-2.5"
            >
              <span className="text-sm text-white">{sub.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#6B7280]">
                  {days === 0 ? "Today" : `${days}d`}
                </span>
                <span className="text-sm font-semibold text-[#D4A853]">
                  {formatCurrency(sub.amount)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
