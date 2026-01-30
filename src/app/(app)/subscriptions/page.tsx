"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  frequency: "monthly" | "yearly" | "weekly";
  nextChargeDate: string;
  active: boolean;
  category: string;
}

interface SubForm {
  name: string;
  amount: string;
  currency: string;
  frequency: "monthly" | "yearly" | "weekly";
  nextChargeDate: string;
  category: string;
}

const emptyForm: SubForm = {
  name: "",
  amount: "",
  currency: "USD",
  frequency: "monthly",
  nextChargeDate: "",
  category: "",
};

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SubForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchSubs = useCallback(async () => {
    try {
      const res = await fetch("/api/subscriptions");
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setSubscriptions(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  const activeSubs = subscriptions.filter((s) => s.active);
  const inactiveSubs = subscriptions.filter((s) => !s.active);
  const totalMonthly = activeSubs.reduce((sum, s) => {
    if (s.frequency === "yearly") return sum + s.amount / 12;
    if (s.frequency === "weekly") return sum + s.amount * 4.33;
    return sum + s.amount;
  }, 0);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(sub: Subscription) {
    setEditingId(sub.id);
    setForm({
      name: sub.name,
      amount: String(sub.amount),
      currency: sub.currency,
      frequency: sub.frequency,
      nextChargeDate: sub.nextChargeDate.slice(0, 10),
      category: sub.category,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = editingId ? `/api/subscriptions/${editingId}` : "/api/subscriptions";
      const method = editingId ? "PUT" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
        }),
      });
      setDialogOpen(false);
      await fetchSubs();
    } catch {
      console.error("[subscriptions] Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    try {
      await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
      );
    } catch {
      console.error("[subscriptions] Toggle failed");
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 pb-4">
        <div className="h-20 animate-pulse rounded-2xl bg-[#111827]/60" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-[#111827]/60" />
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

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Subscriptions</h1>
          <p className="text-sm text-[#9CA3AF]">
            Total:{" "}
            <span className="font-semibold text-[#2DD4BF]">
              {formatCurrency(totalMonthly)}/mo
            </span>
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#D4A853] px-3 text-sm font-medium text-[#0A0E1A] transition-colors hover:bg-[#C9952C]"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Active */}
      <div className="space-y-2">
        {activeSubs.map((sub, i) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => openEdit(sub)}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.06] bg-[#1A1F2E]/60 p-4 backdrop-blur-lg transition-colors hover:border-white/[0.12]"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{sub.name}</p>
              <p className="text-xs text-[#6B7280]">
                {daysUntil(sub.nextChargeDate) === 0
                  ? "Due today"
                  : `${daysUntil(sub.nextChargeDate)}d until next charge`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[#D4A853]">
                {formatCurrency(sub.amount)}
              </span>
              <button
                role="switch"
                aria-checked={sub.active}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleActive(sub.id, sub.active);
                }}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
                  sub.active ? "bg-[#D4A853]" : "bg-[#374151]"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform",
                    sub.active ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Inactive */}
      {inactiveSubs.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-[#6B7280]">
            Inactive
          </h2>
          <div className="space-y-2">
            {inactiveSubs.map((sub) => (
              <div
                key={sub.id}
                onClick={() => openEdit(sub)}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.04] bg-[#1A1F2E]/30 p-4 opacity-60 transition-opacity hover:opacity-80"
              >
                <p className="truncate text-sm text-[#9CA3AF]">{sub.name}</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#6B7280]">
                    {formatCurrency(sub.amount)}
                  </span>
                  <button
                    role="switch"
                    aria-checked={sub.active}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(sub.id, sub.active);
                    }}
                    className="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent bg-[#374151] transition-colors"
                  >
                    <span className="pointer-events-none block h-5 w-5 translate-x-0 rounded-full bg-white shadow-lg transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialog */}
      <AnimatePresence>
        {dialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onClick={() => setDialogOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-white/[0.06] bg-[#1A1F2E]/95 p-6 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {editingId ? "Edit Subscription" : "Add Subscription"}
                </h2>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="rounded-lg p-1.5 text-[#6B7280] hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Subscription name"
                  className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                />
                <div className="flex gap-3">
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="Amount"
                    className="flex h-11 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                  />
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value as SubForm["frequency"] })}
                    className="h-11 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <input
                  type="date"
                  value={form.nextChargeDate}
                  onChange={(e) => setForm({ ...form, nextChargeDate: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                />
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Category (e.g., Entertainment)"
                  className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.amount}
                className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C9952C] text-sm font-semibold text-[#0A0E1A] transition-all hover:brightness-110 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Save Changes" : "Add Subscription"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
