"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface NetWorthCardProps {
  amount: number;
  change: number;
  changePercent: number;
  sparklineData: { value: number }[];
}

export default function NetWorthCard({
  amount,
  change,
  changePercent,
  sparklineData,
}: NetWorthCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-[#D4A853]/10 bg-[#111827]/60 p-5 backdrop-blur-xl"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
        Net Worth
      </p>

      <p className="mt-1 bg-gradient-to-r from-[#D4A853] via-[#E8C97A] to-[#D4A853] bg-clip-text text-4xl font-bold text-transparent">
        {formatCurrency(amount)}
      </p>

      <div className="mt-2 flex items-center gap-1.5">
        {isPositive ? (
          <ArrowUpRight className="h-4 w-4 text-emerald-400" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-400" />
        )}
        <span
          className={cn(
            "text-sm font-medium",
            isPositive ? "text-emerald-400" : "text-red-400"
          )}
        >
          {formatCurrency(Math.abs(change))} ({Math.abs(changePercent).toFixed(1)}%)
        </span>
      </div>

      <div className="mt-4 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparklineData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2DD4BF"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
