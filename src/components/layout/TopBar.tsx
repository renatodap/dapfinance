"use client";


interface TopBarProps {
  pendingCount?: number;
}

export default function TopBar({ pendingCount = 0 }: TopBarProps) {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#0A0E1A]/80 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <span className="bg-gradient-to-r from-[#D4A853] to-[#E8C97A] bg-clip-text text-lg font-bold tracking-tight text-transparent">
          DAPFinance
        </span>

        {pendingCount > 0 && (
          <span className="rounded-full bg-[#2DD4BF] px-2 py-0.5 text-xs font-semibold text-[#0A0E1A]">
            {pendingCount} pending
          </span>
        )}
      </div>
    </header>
  );
}
