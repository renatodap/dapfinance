"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PhotoFile {
  file: File;
  preview: string;
}

interface PhotoUploadProps {
  transactionId: string;
  onUpload: (transactionId: string, files: File[]) => void;
}

export function PhotoUpload({ transactionId, onUpload }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [progress, setProgress] = useState<number | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const newPhotos: PhotoFile[] = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPhotos((prev) => [...prev, ...newPhotos]);
    },
    []
  );

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleUpload() {
    if (photos.length === 0) return;
    setProgress(0);
    const step = 100 / photos.length;
    for (let i = 0; i < photos.length; i++) {
      await new Promise((r) => setTimeout(r, 300));
      setProgress(Math.round((i + 1) * step));
    }
    onUpload(
      transactionId,
      photos.map((p) => p.file)
    );
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setPhotos([]);
    setProgress(null);
  }

  return (
    <div className="space-y-3">
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-[#1A1F2E]/80 backdrop-blur-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors text-sm"
      >
        <Camera className="h-4 w-4" />
        Add Photo
      </button>

      <AnimatePresence>
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-3 gap-2"
          >
            {photos.map((photo, i) => (
              <div
                key={photo.preview}
                className="relative aspect-square rounded-lg overflow-hidden border border-white/[0.06]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.preview}
                  alt={`Upload ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {progress !== null && (
        <div className="h-1.5 w-full rounded-full bg-[#111827] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#D4A853]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      )}

      {photos.length > 0 && progress === null && (
        <button
          onClick={handleUpload}
          className="min-h-[44px] w-full rounded-lg bg-[#D4A853] text-[#0A0E1A] font-medium text-sm hover:bg-[#C9952C] transition-colors"
        >
          Upload {photos.length} Photo{photos.length > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}
