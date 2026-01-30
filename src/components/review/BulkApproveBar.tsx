"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCheck, Loader2 } from "lucide-react";

interface BulkApproveBarProps {
  count: number;
  onApproveAll: () => void;
  loading: boolean;
}

export function BulkApproveBar({ count, onApproveAll, loading }: BulkApproveBarProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-2"
        >
          <div className="mx-auto max-w-lg rounded-xl border border-white/[0.06] bg-[#1A1F2E]/80 backdrop-blur-xl p-3 flex items-center justify-between gap-3 shadow-2xl">
            <span className="text-sm text-[#9CA3AF]">
              {count} transaction{count !== 1 ? "s" : ""} pending
            </span>
            <button
              onClick={onApproveAll}
              disabled={loading}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-[#D4A853] px-5 text-[#0A0E1A] font-medium text-sm hover:bg-[#C9952C] disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Approve All ({count})
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
