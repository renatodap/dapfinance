"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { ReviewCard, type ReviewTransaction } from "@/components/review/ReviewCard";
import { BulkApproveBar } from "@/components/review/BulkApproveBar";
import { NoteModal } from "@/components/review/NoteModal";

export default function ReviewPage() {
  const [transactions, setTransactions] = useState<ReviewTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [activeTransactionId, setActiveTransactionId] = useState("");

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions?status=pending&limit=50");
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setTransactions(
        json.data.map((t: Record<string, unknown>) => ({
          id: t.id as string,
          description: t.description as string,
          merchantName: (t.merchantName as string) ?? undefined,
          amount: t.amount as number,
          currency: (t.currency as string) ?? "USD",
          date: t.date as string,
          aiCategory: (t.category as string) ?? "Uncategorized",
          aiConfidence: (t.aiConfidence as number) ?? 0.5,
          status: t.status as "pending",
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  async function handleApprove(id: string) {
    try {
      await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "reviewed" }),
      });
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch {
      console.error("[review] Failed to approve transaction", id);
    }
  }

  async function handleApproveAll() {
    setBulkLoading(true);
    try {
      await Promise.all(
        transactions.map((t) =>
          fetch(`/api/transactions/${t.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "reviewed" }),
          })
        )
      );
      setTransactions([]);
    } catch {
      console.error("[review] Bulk approve failed");
    } finally {
      setBulkLoading(false);
    }
  }

  function handleAddNote(id: string) {
    setActiveTransactionId(id);
    setNoteModalOpen(true);
  }

  async function handleSaveNote(transactionId: string, note: string, recategorize: boolean) {
    try {
      await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note, recategorize }),
      });
    } catch {
      console.error("[review] Failed to save note", transactionId);
    }
  }

  function handleAddPhoto(id: string) {
    // Photo upload handled inline for now
    void id; // TODO: implement photo upload modal
  }

  if (loading) {
    return (
      <div className="space-y-3 py-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-xl bg-[#111827]/60"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10"
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-400" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-white"
        >
          All caught up!
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-[#6B7280]"
        >
          No transactions need review
        </motion.p>

        {/* Confetti-like dots */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0.5],
              x: Math.cos((i / 12) * Math.PI * 2) * 80,
              y: Math.sin((i / 12) * Math.PI * 2) * 80,
            }}
            transition={{
              duration: 1.2,
              delay: 0.1 + i * 0.05,
              ease: "easeOut",
            }}
            className="absolute h-2 w-2 rounded-full"
            style={{
              backgroundColor: ["#D4A853", "#2DD4BF", "#E8C97A", "#14B8A6"][i % 4],
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Review Queue</h1>
        <span className="rounded-full bg-[#2DD4BF] px-2.5 py-0.5 text-xs font-bold text-[#0A0E1A]">
          {transactions.length}
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {transactions.map((tx) => (
            <ReviewCard
              key={tx.id}
              transaction={tx}
              onApprove={handleApprove}
              onAddNote={handleAddNote}
              onAddPhoto={handleAddPhoto}
            />
          ))}
        </div>
      </AnimatePresence>

      <BulkApproveBar
        count={transactions.length}
        onApproveAll={handleApproveAll}
        loading={bulkLoading}
      />

      <NoteModal
        open={noteModalOpen}
        onOpenChange={setNoteModalOpen}
        transactionId={activeTransactionId}
        onSave={handleSaveNote}
      />
    </div>
  );
}
