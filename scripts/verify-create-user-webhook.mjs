import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

function loadEnvLocalIfNeeded() {
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;

    const key = trimmed.slice(0, idx).trim();
    if (!key || process.env[key]) continue;

    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function fail(message, extra) {
  console.error(`❌ ${message}`);
  if (extra) console.error(extra);
  process.exit(1);
}

function ok(message) {
  console.log(`✅ ${message}`);
}

loadEnvLocalIfNeeded();

const webhookSecret = process.env.WEBHOOK_SECRET;
const baseUrl = (process.env.WEBHOOK_BASE_URL ||
  process.env.VERIFY_BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000").replace(/\/$/, "");
const emailDomain = process.env.VERIFY_EMAIL_DOMAIN || "example.com";

if (!webhookSecret) {
  fail("WEBHOOK_SECRET belum tersedia (set di env atau .env.local).");
}

const testEmail = `verify.${Date.now()}@${emailDomain}`;
const endpoint = `${baseUrl}/api/webhooks/create-user`;

console.log(`➡️  Endpoint : ${endpoint}`);
console.log(`➡️  Test email: ${testEmail}`);

let response;
try {
  response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-key": webhookSecret,
    },
    body: JSON.stringify({ email: testEmail }),
  });
} catch (error) {
  fail("Request gagal (network/DNS/connection).", error);
}

const raw = await response.text();
let json = null;

try {
  json = raw ? JSON.parse(raw) : null;
} catch {
  fail(`Response bukan JSON valid (HTTP ${response.status}).`, raw);
}

if (response.status !== 201) {
  fail(`HTTP status tidak sukses. Expected 201, got ${response.status}.`, json);
}

let redirectPath = null;
try {
  redirectPath = typeof json?.redirect_to === "string" ? new URL(json.redirect_to).pathname : null;
} catch {
  redirectPath = null;
}
const checks = [
  { name: "message", pass: typeof json?.message === "string" && json.message.length > 0 },
  { name: "user.id", pass: typeof json?.user?.id === "string" && json.user.id.length > 0 },
  {
    name: "user.email",
    pass:
      typeof json?.user?.email === "string" &&
      json.user.email.toLowerCase() === testEmail.toLowerCase(),
  },
  {
    name: "magic_link_email_sent",
    pass: json?.magic_link_email_sent === true,
  },
  {
    name: "redirect_to",
    pass: typeof json?.redirect_to === "string" && redirectPath === "/auth/callback",
  },
];

const failedChecks = checks.filter((c) => !c.pass);
if (failedChecks.length > 0) {
  fail(
    `Field wajib sukses tidak terpenuhi: ${failedChecks.map((c) => c.name).join(", ")}`,
    json
  );
}

ok(`Verifikasi sukses (HTTP 201 + field wajib valid). Email otomatis ter-trigger ke ${testEmail}.`);
