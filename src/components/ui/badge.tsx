"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5 transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#D4A853] to-[#C9952C] text-[#0A0E1A] font-semibold",
        secondary:
          "bg-white/[0.06] backdrop-blur border border-white/[0.08] text-[#F9FAFB]",
        destructive:
          "bg-red-500/20 text-red-400 border border-red-500/30",
        outline:
          "border border-white/[0.1] text-[#9CA3AF]",
        pending:
          "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]",
        reviewed:
          "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
        category: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
