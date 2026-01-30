"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, Trash2, Pencil } from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: string;
  color?: string;
  icon?: string;
}

interface CategoryForm {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string;
}

const emptyForm: CategoryForm = { id: "", name: "", type: "expense", color: "#6B7280", icon: "" };

const TYPE_COLORS: Record<string, string> = {
  expense: "text-red-400",
  income: "text-emerald-400",
  transfer: "text-blue-400",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setCategories(json.data);
    } catch {
      console.error("[categories] Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({ id: cat.id, name: cat.name, type: cat.type, color: cat.color ?? "#6B7280", icon: cat.icon ?? "" });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingId) {
        await fetch(`/api/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, type: form.type, color: form.color, icon: form.icon }),
        });
      } else {
        await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      setDialogOpen(false);
      await fetchCategories();
    } catch {
      console.error("[categories] Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      console.error("[categories] Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-[#111827]/60" />
        ))}
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Categories</h1>
        <button
          onClick={openAdd}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#D4A853] px-3 text-sm font-medium text-[#0A0E1A] transition-colors hover:bg-[#C9952C]"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <div className="space-y-2">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#1A1F2E]/60 p-4 backdrop-blur-lg"
          >
            <div className="flex items-center gap-3">
              {cat.color && (
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
              )}
              <div>
                <p className="text-sm font-medium text-white">{cat.name}</p>
                <p className={`text-xs ${TYPE_COLORS[cat.type] ?? "text-[#6B7280]"}`}>{cat.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openEdit(cat)}
                className="rounded-lg p-2 text-[#6B7280] hover:bg-white/5 hover:text-white"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="rounded-lg p-2 text-[#6B7280] hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}

        {categories.length === 0 && (
          <p className="py-12 text-center text-sm text-[#6B7280]">No categories yet.</p>
        )}
      </div>

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
                  {editingId ? "Edit Category" : "Add Category"}
                </h2>
                <button onClick={() => setDialogOpen(false)} className="rounded-lg p-1.5 text-[#6B7280] hover:bg-white/5 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {!editingId && (
                  <input
                    type="text"
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                    placeholder="Category ID (e.g., food_dining)"
                    className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                  />
                )}
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Display name"
                  className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                />
                <div className="flex gap-3">
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="h-11 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-[#F9FAFB] backdrop-blur focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="transfer">Transfer</option>
                  </select>
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="h-11 w-14 cursor-pointer rounded-xl border border-white/[0.08] bg-white/[0.05]"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !form.name || (!editingId && !form.id)}
                className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C9952C] text-sm font-semibold text-[#0A0E1A] transition-all hover:brightness-110 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Save Changes" : "Add Category"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
