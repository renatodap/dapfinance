"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface NoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  onSave: (transactionId: string, note: string, recategorize: boolean) => void;
}

export function NoteModal({ open, onOpenChange, transactionId, onSave }: NoteModalProps) {
  const [note, setNote] = useState("");
  const [recategorize, setRecategorize] = useState(false);

  function handleSave() {
    onSave(transactionId, note.trim(), recategorize);
    setNote("");
    setRecategorize(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent asChild forceMount>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="border-white/[0.06] bg-[#1A1F2E]/90 backdrop-blur-xl text-[#F9FAFB]"
            >
              <DialogHeader>
                <DialogTitle className="text-[#F9FAFB]">Add Note</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note to this transaction..."
                  rows={4}
                  className="w-full rounded-lg border border-white/[0.06] bg-[#111827]/60 backdrop-blur-sm px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40 resize-none"
                />

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-[#9CA3AF]">Re-categorize with AI</span>
                  <button
                    role="switch"
                    aria-checked={recategorize}
                    onClick={() => setRecategorize(!recategorize)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
                      recategorize ? "bg-[#D4A853]" : "bg-[#374151]"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform",
                        recategorize ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </label>
              </div>

              <DialogFooter>
                <button
                  onClick={handleSave}
                  disabled={!note.trim()}
                  className="w-full min-h-[44px] rounded-lg bg-[#D4A853] text-[#0A0E1A] font-medium text-sm hover:bg-[#C9952C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Save Note
                </button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
