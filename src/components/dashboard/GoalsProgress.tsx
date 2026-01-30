"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

interface GoalsProgressProps {
  goals: Goal[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

export default function GoalsProgress({ goals }: GoalsProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl border border-white/5 bg-[#111827]/60 p-5 backdrop-blur-xl"
    >
      <h2 className="text-sm font-medium uppercase tracking-wider text-[#9CA3AF]">
        Goals
      </h2>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-3 space-y-4"
      >
        {goals.map((goal) => {
          const pct = Math.min(
            100,
            (goal.currentAmount / goal.targetAmount) * 100
          );
          const days = daysUntil(goal.targetDate);

          return (
            <motion.div key={goal.id} variants={item}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  {goal.name}
                </span>
                <span className="text-xs text-[#6B7280]">{days}d left</span>
              </div>

              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#1A1F2E]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[#C9952C] to-[#D4A853]"
                />
              </div>

              <p className="mt-1 text-xs text-[#6B7280]">
                <span className="text-[#D4A853]">
                  {formatCurrency(goal.currentAmount)}
                </span>{" "}
                / {formatCurrency(goal.targetAmount)}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
