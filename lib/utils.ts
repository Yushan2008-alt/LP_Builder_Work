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

export function getLimitReachedMessage(limit: number, resourceLabel: "brand" | "produk" | "project"): string {
  return `Kamu sudah mencapai batas ${limit} ${resourceLabel}.`;
}

export function isLimitExceededError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("limit exceeded")
    || normalized.includes("batas maksimum")
    || normalized.includes("mencapai batas")
    || normalized.includes("sudah mencapai batas");
}

export function isSupabaseMissingTableError(message: string): boolean {
  const normalized = message.toLowerCase();
  const hasRelationPublicError = /relation\s+"public\./i.test(message);
  return (
    (normalized.includes("could not find the table") && normalized.includes("schema cache"))
    || hasRelationPublicError
    || normalized.includes("relation does not exist")
  );
}

const DATABASE_NOT_READY_MESSAGE = "Database belum siap (tabel belum dibuat). Jalankan SCHEMA.sql di Supabase SQL Editor lalu coba lagi.";

export function getFriendlyDatabaseError(message: string): string {
  if (isSupabaseMissingTableError(message)) {
    return DATABASE_NOT_READY_MESSAGE;
  }
  return message;
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric", month: "short",
  });
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
}

export function downloadText(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadHtml(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
