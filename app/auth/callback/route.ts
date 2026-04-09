import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_OTP_TYPES = new Set(["signup", "recovery", "invite", "email", "email_change"]);

function encodeError(message: string) {
  return encodeURIComponent(message);
}

function redirectToLogin(request: NextRequest, error: string) {
  return NextResponse.redirect(new URL(`/login?error=${encodeError(error)}`, request.url));
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return redirectToLogin(request, error.message);
    }
  } else if (tokenHash && type) {
    if (!ALLOWED_OTP_TYPES.has(type)) {
      return redirectToLogin(request, "Tipe OTP tidak valid.");
    }

    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "recovery" | "invite" | "email" | "email_change",
      token_hash: tokenHash,
    });

    if (error) {
      return redirectToLogin(request, error.message);
    }
  } else {
    return redirectToLogin(request, "Link login tidak valid.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirectToLogin(request, userError?.message ?? "Gagal mendapatkan user.");
  }

  // Upsert profiles — ensure row exists for this user
  const { error: profileUpsertError } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id }, { onConflict: "user_id" });

  if (profileUpsertError) {
    return redirectToLogin(request, "Gagal menyiapkan profil user.");
  }

  // Read has_password flag to decide where to redirect
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("has_password")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    return redirectToLogin(request, "Gagal membaca status password user.");
  }

  // Users without a password → set password first; otherwise → dashboard
  const destination = profile?.has_password ? "/products" : "/settings/set-password";
  return NextResponse.redirect(new URL(destination, request.url));
}
