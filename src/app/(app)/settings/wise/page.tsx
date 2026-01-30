"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";

export default function WiseSettingsPage() {
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/webhooks/wise`
    : "/api/webhooks/wise";

  function copyUrl() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/wise/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Sync failed");
      setSyncResult(`Synced ${json.data?.count ?? 0} balances`);
    } catch (err) {
      setSyncResult(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="pb-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/settings" className="rounded-lg p-1.5 text-[#6B7280] hover:bg-white/5 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold text-white">Wise Integration</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Webhook URL */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#111827]/60 p-5 backdrop-blur-xl">
          <h2 className="text-sm font-medium uppercase tracking-wider text-[#9CA3AF]">
            Webhook URL
          </h2>
          <p className="mt-2 text-xs text-[#6B7280]">
            Add this URL in your Wise Business settings under Webhooks to receive automatic transaction updates.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg bg-[#0A0E1A] px-3 py-2 text-xs text-[#D4A853]">
              {webhookUrl}
            </code>
            <button
              onClick={copyUrl}
              className="rounded-lg p-2 text-[#6B7280] hover:bg-white/5 hover:text-white"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#111827]/60 p-5 backdrop-blur-xl">
          <h2 className="text-sm font-medium uppercase tracking-wider text-[#9CA3AF]">
            Setup Steps
          </h2>
          <ol className="mt-3 space-y-2 text-sm text-[#9CA3AF]">
            <li>1. Go to Wise Business → Settings → Webhooks</li>
            <li>2. Click &quot;Create new webhook&quot;</li>
            <li>3. Paste the webhook URL above</li>
            <li>4. Select events: <span className="text-white">Transfer state change</span>, <span className="text-white">Balance deposit</span></li>
            <li>5. Save and copy the public key to your <code className="text-[#D4A853]">WISE_PUBLIC_KEY</code> env variable</li>
          </ol>
        </div>

        {/* Manual Sync */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#111827]/60 p-5 backdrop-blur-xl">
          <h2 className="text-sm font-medium uppercase tracking-wider text-[#9CA3AF]">
            Manual Sync
          </h2>
          <p className="mt-2 text-xs text-[#6B7280]">
            Fetch latest balances from Wise API. Requires <code className="text-[#D4A853]">WISE_API_TOKEN</code> env variable.
          </p>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-[#D4A853] px-4 text-sm font-medium text-[#0A0E1A] hover:bg-[#C9952C] disabled:opacity-50"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sync Now
          </button>
          {syncResult && (
            <p className="mt-2 text-xs text-[#9CA3AF]">{syncResult}</p>
          )}
        </div>

        {/* Environment Status */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#111827]/60 p-5 backdrop-blur-xl">
          <h2 className="text-sm font-medium uppercase tracking-wider text-[#9CA3AF]">
            Required Environment Variables
          </h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <code className="text-[#D4A853]">WISE_API_TOKEN</code>
              <span className="text-xs text-[#6B7280]">For API access</span>
            </div>
            <div className="flex items-center justify-between">
              <code className="text-[#D4A853]">WISE_PUBLIC_KEY</code>
              <span className="text-xs text-[#6B7280]">For webhook verification</span>
            </div>
            <div className="flex items-center justify-between">
              <code className="text-[#D4A853]">WISE_PROFILE_ID</code>
              <span className="text-xs text-[#6B7280]">Your Wise profile ID</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
