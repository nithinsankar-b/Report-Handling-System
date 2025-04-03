// components/ui/badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-indigo-50 text-indigo-700 ring-indigo-700/10",
        secondary: "bg-purple-50 text-purple-700 ring-purple/10",
        destructive: "bg-red-50 text-red-700 ring-red-600/10",
        outline: "text-gray-600 bg-gray-50 ring-gray-500/10",
        success: "bg-green-50 text-green-700 ring-green-600/20",
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

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };