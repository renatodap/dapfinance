"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { TransactionFilters, type FilterState } from "@/components/transactions/TransactionFilters";
import { TransactionList, type Transaction } from "@/components/transactions/TransactionList";
import { TransactionDetail } from "@/components/transactions/TransactionDetail";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    status: "",
    account: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchTransactions = useCallback(
    async (pageNum: number, append = false) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          limit: "20",
        });
        if (search) params.set("search", search);
        if (filters.status) params.set("status", filters.status);
        if (filters.category) params.set("category", filters.category);
        if (filters.account) params.set("accountId", filters.account);
        if (filters.dateFrom) params.set("dateFrom", new Date(filters.dateFrom).toISOString());
        if (filters.dateTo) params.set("dateTo", new Date(filters.dateTo).toISOString());

        const res = await fetch(`/api/transactions?${params}`);
        if (!res.ok) throw new Error("Failed to load transactions");
        const json = await res.json();

        if (append) {
          setTransactions((prev) => [...prev, ...json.data]);
        } else {
          setTransactions(json.data);
        }
        setTotalPages(json.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, filters]
  );

  useEffect(() => {
    setPage(1);
    fetchTransactions(1);
  }, [fetchTransactions]);

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    fetchTransactions(next, true);
  }

  function handleTransactionClick(tx: Transaction) {
    setSelectedId(tx.id);
  }

  function handleTransactionDeleted(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="pb-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] pl-10 pr-4 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] backdrop-blur transition-all focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
          />
        </div>
      </motion.div>

      <TransactionFilters filters={filters} onFilterChange={setFilters} />

      <div className="mt-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-[#111827]/60"
              />
            ))}
          </div>
        ) : error ? (
          <p className="py-12 text-center text-sm text-red-400">{error}</p>
        ) : (
          <>
            <TransactionList
              transactions={transactions}
              onTransactionClick={handleTransactionClick}
            />

            {page < totalPages && (
              <div className="mt-4 flex justify-center pb-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-6 text-sm font-medium text-[#9CA3AF] backdrop-blur transition-all hover:bg-white/[0.1] hover:text-white disabled:opacity-50"
                >
                  {loadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Load more"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <TransactionDetail
        transactionId={selectedId}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
        onDeleted={handleTransactionDeleted}
      />
    </div>
  );
}
