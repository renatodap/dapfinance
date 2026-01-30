"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Moon, Info, ChevronRight } from "lucide-react";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function SettingsPage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch {
      // Clear cookie client-side as fallback
      document.cookie = "dapfinance-auth=; Path=/; Max-Age=0";
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-4 pb-4"
    >
      <motion.h1
        variants={fadeUp}
        className="text-lg font-semibold text-white"
      >
        Settings
      </motion.h1>

      {/* Theme */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-white/[0.06] bg-[#111827]/60 p-5 backdrop-blur-xl"
      >
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#9CA3AF]">
          Appearance
        </h2>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="h-5 w-5 text-[#D4A853]" />
            <span className="text-sm text-white">Dark Mode</span>
          </div>
          <div className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-[#D4A853]">
            <span className="pointer-events-none block h-5 w-5 translate-x-5 rounded-full bg-white shadow-lg" />
          </div>
        </div>
        <p className="mt-2 text-xs text-[#6B7280]">
          Dark mode is always enabled for the best experience.
        </p>
      </motion.div>

      {/* Data Management */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-white/[0.06] bg-[#111827]/60 p-5 backdrop-blur-xl"
      >
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#9CA3AF]">
          Data
        </h2>
        <div className="mt-3 space-y-1">
          {[
            { label: "Export Data", desc: "Download all your financial data", action: "export" },
            { label: "Wise Integration", desc: "Manage webhook connection", action: "wise" },
            { label: "Categories", desc: "Customize transaction categories", action: "categories" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.action === "export") {
                  window.location.href = "/api/export";
                } else if (item.action === "wise") {
                  router.push("/settings/wise");
                } else if (item.action === "categories") {
                  router.push("/categories");
                }
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/[0.04]"
            >
              <div>
                <p className="text-sm text-white">{item.label}</p>
                <p className="text-xs text-[#6B7280]">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#6B7280]" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-white/[0.06] bg-[#111827]/60 p-5 backdrop-blur-xl"
      >
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#9CA3AF]">
          About
        </h2>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A853] to-[#C9952C]">
            <Info className="h-5 w-5 text-[#0A0E1A]" />
          </div>
          <div>
            <p className="bg-gradient-to-r from-[#D4A853] via-[#E8C97A] to-[#D4A853] bg-clip-text text-sm font-bold text-transparent">
              DAPFinance
            </p>
            <p className="text-xs text-[#6B7280]">Version 1.0.0</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#6B7280]">
          Premium personal finance management. Built with Next.js, Prisma, and AI-powered categorization.
        </p>
      </motion.div>

      {/* Logout */}
      <motion.div variants={fadeUp}>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "Logging out..." : "Log Out"}
        </button>
      </motion.div>
    </motion.div>
  );
}
