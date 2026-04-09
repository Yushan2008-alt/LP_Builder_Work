"use client";

/**
 * Auth Callback Page — Client Component
 *
 * Why client-side instead of a Route Handler:
 *   @supabase/ssr's createBrowserClient stores the PKCE code verifier in
 *   browser localStorage. A server Route Handler cannot access localStorage,
 *   so exchangeCodeForSession always fails with "PKCE code verifier not found".
 *   Running the exchange client-side fixes this by using the same storage.
 *
 * Supports two flows:
 *   1. PKCE code flow   → ?code=xxx           (signInWithOtp from login page)
 *   2. Token-hash flow  → ?token_hash=x&type= (webhook-generated / email template)
 */

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg animate-pulse">
        <span className="text-2xl font-bold text-white">LP</span>
      </div>
      <p className="text-gray-600 text-sm">Memverifikasi akun kamu...</p>
    </div>
  </div>
);

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handled = useRef(false); // prevent double-run in React strict-mode

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    async function handleCallback() {
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") ?? "magiclink";
      const next = searchParams.get("next") ?? "/products";

      const supabase = createClient();

      // ── 1. Exchange code or verify OTP ──────────────────────────────────
      if (code) {
        // PKCE flow: verifier is in browser localStorage — works correctly here
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace(`/login?error=${encodeURIComponent(error.message)}`);
          return;
        }
      } else if (tokenHash) {
        // Token-hash flow: no PKCE needed, works cross-device
        const { error } = await supabase.auth.verifyOtp({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: type as any,
          token_hash: tokenHash,
        });
        if (error) {
          router.replace(`/login?error=${encodeURIComponent(error.message)}`);
          return;
        }
      } else {
        router.replace("/login?error=Link+tidak+valid+atau+sudah+kadaluarsa");
        return;
      }

      // ── 2. Get authenticated user ────────────────────────────────────────
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace(
          `/login?error=${encodeURIComponent(userError?.message ?? "Gagal mendapatkan user")}`
        );
        return;
      }

      // ── 3. Ensure profiles row exists ────────────────────────────────────
      const { error: profileUpsertError } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id }, { onConflict: "user_id" });

      if (profileUpsertError) {
        // Non-fatal: continue to products if profiles fails
        console.warn("[auth/callback] profiles upsert:", profileUpsertError.message);
        router.replace(next);
        return;
      }

      // ── 4. Check if user has set a password ──────────────────────────────
      const { data: profile } = await supabase
        .from("profiles")
        .select("has_password")
        .eq("user_id", user.id)
        .maybeSingle();

      // First-time login → set password; returning user → products
      const destination = profile?.has_password ? next : "/settings/set-password";
      router.replace(destination);
    }

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg animate-pulse">
          <span className="text-2xl font-bold text-white">LP</span>
        </div>
        <p className="text-gray-600 text-sm">Memverifikasi akun kamu...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CallbackHandler />
    </Suspense>
  );
}
