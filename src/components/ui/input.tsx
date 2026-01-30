"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl bg-white/[0.05] backdrop-blur border border-white/[0.08] px-3 py-2 text-[16px] text-[#F9FAFB] placeholder:text-gray-500 transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus:ring-2 focus:ring-[#D4A853]/40 focus:border-[#D4A853]/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
