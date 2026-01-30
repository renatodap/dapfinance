"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TransactionDetailData {
  id: string;
  description: string;
  merchantName?: string;
  amount: number;
  currency: string;
  date: string;
  category?: string;
  status: string;
  note?: string;
  tags: string[];
  source: string;
  items: { id: string; name: string; amount: number; quantity: number; category?: string }[];
  photos: { id: string; storagePath: string }[];
}

interface TransactionDetailProps {
  transactionId: string | null;
  open: boolean;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export function TransactionDetail({ transactionId, open, onClose, onDeleted }: TransactionDetailProps) {
  const [data, setData] = useState<TransactionDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!transactionId || !open) return;
    setLoading(true);
    fetch(`/api/transactions/${transactionId}`)
      .then((r) => r.json())
      .then((json) => {
        const t = json.data;
        setData({
          id: t.id,
          description: t.description,
          merchantName: t.merchantName ?? undefined,
          amount: Number(t.amount),
          currency: t.currency,
          date: t.date,
          category: t.category ?? "Uncategorized",
          status: t.status,
          note: t.note ?? undefined,
          tags: t.tags ?? [],
          source: t.source,
          items: (t.items ?? []).map((i: Record<string, unknown>) => ({
            id: i.id,
            name: i.name,
            amount: Number(i.amount),
            quantity: i.quantity,
            category: i.category,
          })),
          photos: (t.photos ?? []).map((p: Record<string, unknown>) => ({
            id: p.id,
            storagePath: p.storagePath,
          })),
        });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [transactionId, open]);

  async function handleDelete() {
    if (!data) return;
    if (!confirm("Delete this transaction?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/transactions/${data.id}`, { method: "DELETE" });
      onDeleted(data.id);
      onClose();
    } catch {
      console.error("[transaction-detail] Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-2xl border-t border-white/[0.06] bg-[#1A1F2E]/95 p-6 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Transaction Detail</h2>
              <button onClick={onClose} className="rounded-lg p-1.5 text-[#6B7280] hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#D4A853]" />
              </div>
            ) : data ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-[#6B7280]">Description</p>
                  <p className="text-sm font-medium text-white">{data.merchantName || data.description}</p>
                  {data.merchantName && <p className="text-xs text-[#6B7280]">{data.description}</p>}
                </div>

                <div className="flex gap-6">
                  <div>
                    <p className="text-sm text-[#6B7280]">Amount</p>
                    <p className={cn("text-lg font-bold", data.amount < 0 ? "text-red-400" : "text-emerald-400")}>
                      {formatCurrency(data.amount, data.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6B7280]">Date</p>
                    <p className="text-sm text-white">{formatDate(data.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6B7280]">Status</p>
                    <span className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                      data.status === "reviewed" ? "bg-emerald-500/10 text-emerald-400" :
                      data.status === "pending" ? "bg-amber-500/10 text-amber-400" : "bg-gray-500/10 text-gray-400"
                    )}>
                      {data.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div>
                    <p className="text-sm text-[#6B7280]">Category</p>
                    <p className="text-sm text-white">{data.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6B7280]">Source</p>
                    <p className="text-sm text-white">{data.source}</p>
                  </div>
                </div>

                {data.note && (
                  <div>
                    <p className="text-sm text-[#6B7280]">Note</p>
                    <p className="text-sm text-white">{data.note}</p>
                  </div>
                )}

                {data.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-[#6B7280]">Tags</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {data.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-[#111827] px-2 py-0.5 text-xs text-[#9CA3AF]">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {data.items.length > 0 && (
                  <div>
                    <p className="text-sm text-[#6B7280]">Items</p>
                    <div className="mt-1 space-y-1">
                      {data.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-white">{item.name} x{item.quantity}</span>
                          <span className="text-[#D4A853]">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete Transaction
                </button>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[#6B7280]">Failed to load transaction</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
