"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Invalid password");
        setShake(true);
        setTimeout(() => setShake(false), 600);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#0A0E1A] px-6">
      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#D4A853]/20 blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -25, 35, 0],
          y: [0, 30, -25, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-[#2DD4BF]/15 blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, 20, -30, 0],
          y: [0, -20, 35, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-purple-500/10 blur-[100px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="bg-gradient-to-r from-[#D4A853] via-[#E8C97A] to-[#D4A853] bg-clip-text text-5xl font-bold tracking-tight text-transparent">
            DAPFinance
          </h1>
          <p className="mt-2 text-[#9CA3AF]">Your finances, elevated.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          onSubmit={handleSubmit}
          className={cn("mt-10 space-y-4", shake && "animate-[shake_0.5s_ease-in-out]")}
        >
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="flex h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 text-[16px] text-[#F9FAFB] placeholder:text-[#6B7280] backdrop-blur transition-all duration-200 focus:border-[#D4A853]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C9952C] text-[#0A0E1A] font-semibold shadow-lg shadow-[#D4A853]/20 transition-all duration-200 hover:shadow-xl hover:shadow-[#D4A853]/30 hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="block h-5 w-5 rounded-full border-2 border-[#0A0E1A]/30 border-t-[#0A0E1A]"
              />
            ) : (
              "Log In"
            )}
          </button>
        </motion.form>
      </motion.div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
