"use client";

import { motion } from "framer-motion";
import { Check, MessageSquare, Camera } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export interface ReviewTransaction {
  id: string;
  description: string;
  merchantName?: string;
  amount: number;
  currency: string;
  date: string;
  aiCategory: string;
  aiConfidence: number;
  status: "pending" | "reviewed" | "auto";
}

interface ReviewCardProps {
  transaction: ReviewTransaction;
  onApprove: (id: string) => void;
  onAddNote: (id: string) => void;
  onAddPhoto: (id: string) => void;
}

function confidenceColor(confidence: number) {
  if (confidence >= 0.9) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (confidence >= 0.7) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
}

export function ReviewCard({ transaction, onApprove, onAddNote, onAddPhoto }: ReviewCardProps) {
  const { id, description, merchantName, amount, currency, date, aiCategory, aiConfidence } = transaction;
  const isNegative = amount < 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-white/[0.06] bg-[#1A1F2E]/60 backdrop-blur-lg p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[#F9FAFB] font-medium truncate">
            {merchantName || description}
          </p>
          {merchantName && merchantName !== description && (
            <p className="text-[#6B7280] text-sm truncate">{description}</p>
          )}
          <p className="text-[#6B7280] text-xs mt-1">{formatDate(date)}</p>
        </div>
        <span
          className={cn(
            "text-lg font-semibold tabular-nums whitespace-nowrap",
            isNegative ? "text-red-400" : "text-emerald-400"
          )}
        >
          {formatCurrency(amount, currency)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
            confidenceColor(aiConfidence)
          )}
        >
          {aiCategory}
          <span className="ml-1.5 opacity-70">{Math.round(aiConfidence * 100)}%</span>
        </span>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onApprove(id)}
          className="min-h-[44px] min-w-[44px] flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#D4A853] text-[#0A0E1A] font-medium text-sm hover:bg-[#C9952C] transition-colors"
        >
          <Check className="h-4 w-4" />
          Approve
        </button>
        <button
          onClick={() => onAddNote(id)}
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-white/[0.06] bg-[#1A1F2E]/80 text-[#6B7280] hover:text-[#F9FAFB] transition-colors px-3"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
        <button
          onClick={() => onAddPhoto(id)}
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-white/[0.06] bg-[#1A1F2E]/80 text-[#6B7280] hover:text-[#F9FAFB] transition-colors px-3"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
