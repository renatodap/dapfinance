"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ImportSummary {
  total: number;
  imported: number;
  duplicates: number;
  bank: string;
}

interface ImportCSVProps {
  onImport?: (rows: Record<string, string>[], bank: string) => Promise<ImportSummary>;
}

const BANK_SIGNATURES: Record<string, string[]> = {
  boa: ["Posted Date", "Reference Number", "Payee", "Address"],
  fidelity: ["Run Date", "Action", "Symbol", "Security Description"],
};

function detectBank(headers: string[]): string {
  const normalized = headers.map((h) => h.trim());
  for (const [bank, sigs] of Object.entries(BANK_SIGNATURES)) {
    if (sigs.some((s) => normalized.includes(s))) return bank;
  }
  return "unknown";
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = (lines[0] ?? "").split(",").map((h) => h.replace(/^"|"$/g, "").trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.replace(/^"|"$/g, "").trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? "";
    });
    return obj;
  });
  return { headers, rows };
}

export function ImportCSV({ onImport }: ImportCSVProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setSummary(null);
      setProgress(10);
      const text = await file.text();
      setProgress(30);
      const { headers, rows } = parseCSV(text);
      const bank = detectBank(headers);
      setProgress(60);

      if (onImport) {
        const result = await onImport(rows, bank);
        setProgress(100);
        setSummary(result);
      } else {
        setProgress(100);
        setSummary({
          total: rows.length,
          imported: rows.length,
          duplicates: 0,
          bank,
        });
      }
      setTimeout(() => setProgress(null), 600);
    },
    [onImport]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.name.endsWith(".csv")) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragging
            ? "border-[#D4A853]/60 bg-[#D4A853]/5"
            : "border-white/[0.08] bg-[#1A1F2E]/40 hover:border-white/[0.15]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
            e.target.value = "";
          }}
        />
        <FileSpreadsheet className="mx-auto h-10 w-10 text-[#6B7280] mb-3" />
        <p className="text-sm text-[#9CA3AF]">
          Drag & drop a CSV file or{" "}
          <span className="text-[#D4A853] font-medium">browse</span>
        </p>
        <p className="text-xs text-[#6B7280] mt-1">
          Auto-detects Bank of America & Fidelity formats
        </p>
      </div>

      {progress !== null && (
        <div className="h-1.5 w-full rounded-full bg-[#111827] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#D4A853]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          />
        </div>
      )}

      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <Card className="border-white/[0.06] bg-[#1A1F2E]/60 backdrop-blur-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Import Complete</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-semibold text-[#F9FAFB]">{summary.imported}</p>
                  <p className="text-[10px] text-[#6B7280] uppercase">New</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-amber-400">{summary.duplicates}</p>
                  <p className="text-[10px] text-[#6B7280] uppercase">Skipped</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#9CA3AF]">{summary.bank}</p>
                  <p className="text-[10px] text-[#6B7280] uppercase">Bank</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-white/[0.06] text-[#9CA3AF] hover:text-[#F9FAFB]"
                onClick={() => setSummary(null)}
              >
                Import Another
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
