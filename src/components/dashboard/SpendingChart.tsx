"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface SpendingDataItem {
  name: string;
  value: number;
  color: string;
}

interface SpendingChartProps {
  data: SpendingDataItem[];
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-white/10 bg-[#111827]/90 px-3 py-2 text-xs backdrop-blur-xl">
      <p className="font-medium text-white">{d.name}</p>
      <p className="text-[#D4A853]">{formatCurrency(d.value ?? 0)}</p>
    </div>
  );
}

export default function SpendingChart({ data }: SpendingChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl border border-white/5 bg-[#111827]/60 p-5 backdrop-blur-xl"
    >
      <h2 className="text-sm font-medium uppercase tracking-wider text-[#9CA3AF]">
        Spending
      </h2>

      <div className="relative mt-3 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-[#6B7280]">This month</span>
          <span className="text-lg font-bold text-[#D4A853]">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-xs text-[#9CA3AF]">{d.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
