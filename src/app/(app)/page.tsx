"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AccountsList from "@/components/dashboard/AccountsList";
import SpendingChart from "@/components/dashboard/SpendingChart";
import BudgetOverview from "@/components/dashboard/BudgetOverview";
import DebtCard from "@/components/dashboard/DebtCard";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { formatCurrency } from "@/lib/utils";

interface DashboardData {
  accounts: any[];
  totalUsd: number;
  budget: any[];
  transactions: any[];
  andrewDebt: number;
  monthSpent: number;
  monthIncome: number;
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-[#111827]/60 ${className ?? ""}`} />
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((json) => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 pb-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
        <Skeleton className="h-56" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-red-400">Failed to load dashboard</p>
      </div>
    );
  }

  const now = new Date();
  const monthName = now.toLocaleDateString("en-US", { month: "long" });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4 pb-4">
      {/* Total Balance */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-[#D4A853]/10 bg-[#111827]/60 p-5 backdrop-blur-xl"
      >
        <p className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
          Total Balance <span className="normal-case tracking-normal text-[#6B7280]">≈ USD</span>
        </p>
        <p className="mt-1 bg-gradient-to-r from-[#D4A853] via-[#E8C97A] to-[#D4A853] bg-clip-text text-4xl font-bold text-transparent">
          {formatCurrency(data.totalUsd)}
        </p>
        <div className="mt-2 flex gap-4 text-xs text-[#6B7280]">
          <span>{monthName}: <span className="text-white">{formatCurrency(data.monthSpent)}</span> spent</span>
          <span><span className="text-emerald-400">{formatCurrency(data.monthIncome)}</span> income</span>
        </div>
      </motion.div>

      {/* Budget Envelopes */}
      <motion.div variants={fadeUp}>
        <BudgetOverview data={data.budget} />
      </motion.div>

      {/* Spending Pie */}
      {data.budget.length > 0 && (
        <motion.div variants={fadeUp}>
          <SpendingChart data={data.budget.filter((b: any) => b.value > 0)} />
        </motion.div>
      )}

      {/* Andrew Debt */}
      <motion.div variants={fadeUp}>
        <DebtCard amount={data.andrewDebt} />
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={fadeUp}>
        <RecentTransactions transactions={data.transactions} />
      </motion.div>

      {/* Accounts */}
      <motion.div variants={fadeUp}>
        <AccountsList
          accounts={data.accounts.map((a: any) => ({
            id: a.id,
            name: a.name,
            institution: a.account_type,
            currency: a.currency,
            currentBalance: Number(a.balance),
            lastSyncedAt: a.updated_at,
          }))}
        />
      </motion.div>
    </motion.div>
  );
}
