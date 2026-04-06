import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

export function generateProjectName(formulaName: string, productName: string): string {
  const date = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
  return `${productName} — ${formulaName} (${date})`;
}
