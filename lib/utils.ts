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

type DatabaseErrorLike = string | { message?: string | null; code?: string | null };

const APP_DATABASE_TABLES = ["brands", "products", "projects", "sections", "user_limits"];
const MISSING_TABLE_ERROR_CODES = new Set(["42P01", "PGRST205"]);

function extractDatabaseErrorMessage(error: DatabaseErrorLike): string {
  if (typeof error === "string") return error;
  return error.message ?? "";
}

function isAppDatabaseTableMentioned(message: string): boolean {
  const normalized = message.toLowerCase();
  return APP_DATABASE_TABLES.some((table) => normalized.includes(table));
}

export function isSupabaseMissingTableError(error: DatabaseErrorLike): boolean {
  if (typeof error !== "string" && error.code && MISSING_TABLE_ERROR_CODES.has(error.code)) {
    return true;
  }

  const message = extractDatabaseErrorMessage(error);
  const normalized = message.toLowerCase();
  const hasSchemaCacheTableError = normalized.includes("could not find the table")
    && normalized.includes("schema cache")
    && isAppDatabaseTableMentioned(message);
  const hasMissingRelationError = /relation\s+"(?:public\.)?([a-z_]+)"\s+does not exist/i
    .test(message);

  if (hasSchemaCacheTableError) return true;
  if (!hasMissingRelationError) return false;
  return isAppDatabaseTableMentioned(message);
}

const DATABASE_NOT_READY_MESSAGE = "Database belum siap (tabel belum dibuat). Jalankan SCHEMA.sql di Supabase SQL Editor lalu coba lagi.";

export function getFriendlyDatabaseError(error: DatabaseErrorLike): string {
  if (isSupabaseMissingTableError(error)) {
    return DATABASE_NOT_READY_MESSAGE;
  }
  return extractDatabaseErrorMessage(error) || "Terjadi kesalahan pada database.";
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
