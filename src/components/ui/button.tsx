"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0E1A] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#D4A853] to-[#C9952C] text-[#0A0E1A] font-semibold shadow-lg shadow-[#D4A853]/20 hover:shadow-xl hover:shadow-[#D4A853]/30 hover:brightness-110 active:brightness-95",
        secondary:
          "bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] text-[#F9FAFB] hover:bg-white/[0.1] hover:border-white/[0.12]",
        ghost:
          "text-[#9CA3AF] hover:bg-white/[0.06] hover:text-[#F9FAFB]",
        destructive:
          "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300",
        outline:
          "border border-white/[0.1] text-[#F9FAFB] hover:bg-white/[0.06] hover:border-white/[0.15]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
