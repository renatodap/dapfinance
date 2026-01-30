"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

interface GoalForm {
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
}

const emptyForm: GoalForm = {
  name: "",
  targetAmount: "",
  currentAmount: "0",
  targetDate: "",
};

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch("/api/goals");
      if (!res.ok) throw new Error("Failed to load goals");
      const json = await res.json();
      setGoals(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(goal: Goal) {
    setEditingId(goal.id);
    setForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      targetDate: goal.targetDate.slice(0, 10),
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = editingId ? `/api/goals/${editingId}` : "/api/goals";
      const method = editingId ? "PUT" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          targetAmount: parseFloat(form.targetAmount),
          currentAmount: parseFloat(form.currentAmount),
          targetDate: form.targetDate,
        }),
      });
      setDialogOpen(false);
      await fetchGoals();
    } catch {
      console.error("[goals] Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateAmount(id: string, currentAmount: number) {
    const newAmount = prompt("Enter current amount:", String(currentAmount));
    if (newAmount === null) return;
    const parsed = parseFloat(newAmount);
    if (isNaN(parsed)) return;

    try {
      await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentAmount: parsed }),
      });
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, currentAmount: parsed } : g))
      );
    } catch {
      console.error("[goals] Update amount failed");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#111827]/60" />
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
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Goals</h1>
        <button
          onClick={openAdd}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#D4A853] px-3 text-sm font-medium text-[#0A0E1A] transition-colors hover:bg-[#C9952C]"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <div className="space-y-4">
        {goals.map((goal, i) => {
          const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const days = daysUntil(goal.targetDate);

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => openEdit(goal)}
              className="cursor-pointer rounded-2xl border border-white/5 bg-[#111827]/60 p-5 backdrop-blur-xl transition-colors hover:border-white/[0.1]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{goal.name}</span>
                <span className="text-xs text-[#6B7280]">{days}d left</span>
              </div>

              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#1A1F2E]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[#C9952C] to-[#D4A853]"
                />
              </div>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-[#6B7280]">
                  <span className="text-[#D4A853]">
                    {formatCurrency(goal.currentAmount)}
                  </span>{" "}
                  / {formatCurrency(goal.targetAmount)}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateAmount(goal.id, goal.currentAmount);
                  }}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-[#2DD4BF] transition-colors hover:bg-[#2DD4BF]/10"
                >
                  Update
                </button>
              </div>
            </motion.div>
          );
        })}

        {goals.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-[#6B7280]">No goals yet. Create one to get started!</p>
          </div>
        )}
      </div>

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
                  {editingId ? "Edit Goal" : "Add Goal"}
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
                  placeholder="Goal name"
                  className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                />
                <div className="flex gap-3">
                  <input
                    type="number"
                    step="0.01"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    placeholder="Target amount"
                    className="flex h-11 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={form.currentAmount}
                    onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                    placeholder="Current"
                    className="flex h-11 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                  />
                </div>
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.targetAmount}
                className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C9952C] text-sm font-semibold text-[#0A0E1A] transition-all hover:brightness-110 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Save Changes" : "Add Goal"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
