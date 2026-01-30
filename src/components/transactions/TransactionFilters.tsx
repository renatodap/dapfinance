"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  category: string;
  status: string;
  account: string;
  dateFrom: string;
  dateTo: string;
}

interface TransactionFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories?: string[];
  accounts?: string[];
}

const statuses = ["All", "pending", "reviewed", "auto"];

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all whitespace-nowrap",
        active
          ? "bg-[#D4A853]/15 border-[#D4A853]/40 text-[#D4A853] shadow-[0_0_8px_rgba(212,168,83,0.15)]"
          : "bg-[#1A1F2E]/60 border-white/[0.06] text-[#9CA3AF] hover:text-[#F9FAFB]"
      )}
    >
      {label}
    </button>
  );
}

export function TransactionFilters({
  filters,
  onFilterChange,
  categories = ["All", "Food", "Transport", "Shopping", "Bills", "Income", "Transfer", "Other"],
  accounts = ["All", "Checking", "Savings", "Credit Card"],
}: TransactionFiltersProps) {
  const hasActive =
    filters.category !== "" ||
    filters.status !== "" ||
    filters.account !== "" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "";

  function update(patch: Partial<FilterState>) {
    onFilterChange({ ...filters, ...patch });
  }

  function clearAll() {
    onFilterChange({ category: "", status: "", account: "", dateFrom: "", dateTo: "" });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Category row */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            active={filters.category === (cat === "All" ? "" : cat)}
            onClick={() => update({ category: cat === "All" ? "" : cat })}
          />
        ))}
      </div>

      {/* Status row */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        {statuses.map((s) => (
          <Chip
            key={s}
            label={s === "All" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
            active={filters.status === (s === "All" ? "" : s)}
            onClick={() => update({ status: s === "All" ? "" : s })}
          />
        ))}
      </div>

      {/* Account row */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        {accounts.map((acc) => (
          <Chip
            key={acc}
            label={acc}
            active={filters.account === (acc === "All" ? "" : acc)}
            onClick={() => update({ account: acc === "All" ? "" : acc })}
          />
        ))}
      </div>

      {/* Date range */}
      <div className="flex gap-2">
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update({ dateFrom: e.target.value })}
          className="flex-1 rounded-lg border border-white/[0.06] bg-[#111827]/60 px-3 py-2 text-xs text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => update({ dateTo: e.target.value })}
          className="flex-1 rounded-lg border border-white/[0.06] bg-[#111827]/60 px-3 py-2 text-xs text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
        />
      </div>

      {/* Clear all */}
      {hasActive && (
        <button
          onClick={clearAll}
          className="inline-flex items-center gap-1 text-xs text-[#D4A853] hover:text-[#C9952C] transition-colors"
        >
          <X className="h-3 w-3" />
          Clear all filters
        </button>
      )}
    </motion.div>
  );
}
