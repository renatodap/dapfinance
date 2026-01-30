"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NetWorthCard from "@/components/dashboard/NetWorthCard";
import PendingBadge from "@/components/dashboard/PendingBadge";
import SpendingChart from "@/components/dashboard/SpendingChart";
import AccountsList from "@/components/dashboard/AccountsList";
import SubscriptionsSummary from "@/components/dashboard/SubscriptionsSummary";
import GoalsProgress from "@/components/dashboard/GoalsProgress";

interface DashboardData {
  netWorth: {
    amount: number;
    change: number;
    changePercent: number;
    sparklineData: { value: number }[];
  };
  pendingCount: number;
  spending: { name: string; value: number; color: string }[];
  accounts: {
    id: string;
    name: string;
    institution: string;
    currency: string;
    currentBalance: number;
    lastSyncedAt: string;
  }[];
  subscriptions: {
    items: { id: string; name: string; amount: number; nextChargeDate: string }[];
    totalMonthly: number;
  };
  goals: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
  }[];
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[#111827]/60 ${className ?? ""}`}
    />
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to load dashboard");
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 pb-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-16" />
        <Skeleton className="h-56" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-center text-sm text-red-400">
          {error || "Failed to load dashboard"}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-4 pb-4"
    >
      <motion.div variants={fadeUp}>
        <NetWorthCard
          amount={data.netWorth.amount}
          change={data.netWorth.change}
          changePercent={data.netWorth.changePercent}
          sparklineData={data.netWorth.sparklineData}
        />
      </motion.div>

      {data.pendingCount > 0 && (
        <motion.div variants={fadeUp}>
          <PendingBadge count={data.pendingCount} />
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <SpendingChart data={data.spending} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <AccountsList accounts={data.accounts} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <SubscriptionsSummary
          subscriptions={data.subscriptions.items}
          totalMonthly={data.subscriptions.totalMonthly}
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        <GoalsProgress goals={data.goals} />
      </motion.div>
    </motion.div>
  );
}
