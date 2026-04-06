import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "blue" | "green" | "yellow" | "red" | "purple" | "orange" | "gray";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
    gray: "bg-gray-100 text-gray-600",
  };
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 font-medium rounded-full", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}

export function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    foundational: { label: "Foundational", variant: "blue" },
    comprehensive: { label: "Comprehensive", variant: "purple" },
    modern: { label: "Modern Guru", variant: "green" },
    specialized: { label: "Specialized", variant: "orange" },
    custom: { label: "Custom", variant: "gray" },
  };
  const info = map[tier] ?? { label: tier, variant: "default" };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}
