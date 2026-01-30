"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface PendingBadgeProps {
  count: number;
}

export default function PendingBadge({ count }: PendingBadgeProps) {
  if (count <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        href="/review"
        className="block rounded-2xl border border-[#D4A853]/20 bg-[#D4A853]/5 p-4 backdrop-blur-xl transition-colors hover:bg-[#D4A853]/10"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4A853]/10">
            <AlertCircle className="h-5 w-5 animate-pulse text-[#D4A853]" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-white">
              Review{" "}
              <span className="rounded-full bg-[#2DD4BF] px-2 py-0.5 text-xs font-bold text-[#0A0E1A]">
                {count}
              </span>{" "}
              Transaction{count !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-[#6B7280]">
              Pending categorization
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
