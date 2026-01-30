"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Upload, X, Loader2 } from "lucide-react";
import AccountsList from "@/components/dashboard/AccountsList";

interface Account {
  id: string;
  name: string;
  institution: string;
  currency: string;
  currentBalance: number;
  lastSyncedAt: string;
}

interface AccountForm {
  name: string;
  institution: string;
  currency: string;
  currentBalance: string;
}

const emptyForm: AccountForm = {
  name: "",
  institution: "",
  currency: "USD",
  currentBalance: "0",
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      if (!res.ok) throw new Error("Failed to load accounts");
      const json = await res.json();
      setAccounts(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = editingId ? `/api/accounts/${editingId}` : "/api/accounts";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          currentBalance: parseFloat(form.currentBalance),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setDialogOpen(false);
      await fetchAccounts();
    } catch {
      console.error("[accounts] Failed to save account");
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickUpdate(id: string) {
    const newBalance = prompt("Enter new balance:");
    if (newBalance === null) return;
    const parsed = parseFloat(newBalance);
    if (isNaN(parsed)) return;

    try {
      await fetch(`/api/accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentBalance: parsed }),
      });
      await fetchAccounts();
    } catch {
      console.error("[accounts] Quick update failed");
    }
  }

  async function handleCsvImport() {
    if (!csvFile) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      const res = await fetch("/api/import/csv", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Import failed");
      setCsvFile(null);
      await fetchAccounts();
    } catch {
      console.error("[accounts] CSV import failed");
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 py-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-[#111827]/60" />
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
        <h1 className="text-lg font-semibold text-white">Accounts</h1>
        <button
          onClick={openAdd}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#D4A853] px-3 text-sm font-medium text-[#0A0E1A] transition-colors hover:bg-[#C9952C]"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <AccountsList accounts={accounts} onUpdate={handleQuickUpdate} />

      {/* CSV Import */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 rounded-2xl border border-white/5 bg-[#111827]/60 p-5 backdrop-blur-xl"
      >
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#9CA3AF]">
          Import CSV
        </h2>
        <div className="mt-3 flex items-center gap-3">
          <label className="flex-1 cursor-pointer">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.03] text-sm text-[#9CA3AF] transition-colors hover:border-[#D4A853]/40 hover:text-white">
              <Upload className="h-4 w-4" />
              {csvFile ? csvFile.name : "Choose CSV file"}
            </div>
          </label>
          {csvFile && (
            <button
              onClick={handleCsvImport}
              disabled={importing}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#D4A853] px-4 text-sm font-medium text-[#0A0E1A] transition-colors hover:bg-[#C9952C] disabled:opacity-50"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import"}
            </button>
          )}
        </div>
      </motion.div>

      {/* Dialog */}
      <AnimatePresence>
        {dialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
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
                  {editingId ? "Edit Account" : "Add Account"}
                </h2>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Account name"
                  className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                />
                <input
                  type="text"
                  value={form.institution}
                  onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  placeholder="Institution"
                  className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                />
                <div className="flex gap-3">
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="h-11 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="BRL">BRL</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={form.currentBalance}
                    onChange={(e) => setForm({ ...form, currentBalance: e.target.value })}
                    placeholder="Balance"
                    className="flex h-11 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C9952C] text-sm font-semibold text-[#0A0E1A] transition-all hover:brightness-110 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Save Changes" : "Add Account"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
