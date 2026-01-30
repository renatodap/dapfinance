"use client";

import { motion } from "framer-motion";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  institution: string;
  currency: string;
  currentBalance: number;
  lastSyncedAt: string;
}

interface AccountsListProps {
  accounts: Account[];
  onUpdate?: (id: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function AccountsList({ accounts, onUpdate }: AccountsListProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      <h2 className="text-sm font-medium uppercase tracking-wider text-[#9CA3AF]">
        Accounts
      </h2>

      {accounts.map((account) => (
        <motion.div
          key={account.id}
          variants={item}
          className="flex items-center justify-between rounded-xl border border-white/5 bg-[#111827]/60 p-4 backdrop-blur-xl"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {account.name}
            </p>
            <p className="text-xs text-[#6B7280]">{account.institution}</p>
            <p className="mt-0.5 text-[10px] text-[#6B7280]">
              Synced {formatDate(account.lastSyncedAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-[#D4A853]">
                {formatCurrency(account.currentBalance)}
              </p>
              <span className="rounded-full bg-[#1A1F2E] px-1.5 py-0.5 text-[10px] font-medium text-[#9CA3AF]">
                {account.currency}
              </span>
            </div>

            {onUpdate && (
              <button
                onClick={() => onUpdate(account.id)}
                className="rounded-lg px-2.5 py-1 text-xs font-medium text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-white"
              >
                Update
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
