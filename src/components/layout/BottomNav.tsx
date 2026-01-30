"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CheckCircle2,
  ArrowUpDown,
  Wallet,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/review", icon: CheckCircle2, label: "Review" },
  { href: "/transactions", icon: ArrowUpDown, label: "Activity" },
  { href: "/accounts", icon: Wallet, label: "Accounts" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#0A0E1A]/80 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-[60px] max-w-lg items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1 text-xs transition-colors",
                isActive ? "text-[#D4A853]" : "text-[#6B7280]"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 rounded-xl bg-[#D4A853]/10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "relative z-10 h-5 w-5",
                  isActive && "drop-shadow-[0_0_6px_rgba(212,168,83,0.5)]"
                )}
              />
              <span className="relative z-10 font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
