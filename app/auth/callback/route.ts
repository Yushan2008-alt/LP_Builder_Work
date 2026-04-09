import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const { error: profileUpsertError } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: user.id,
        tier: "baseline",
      },
      { onConflict: "user_id" }
    );

  if (profileUpsertError) {
    return redirectToLogin(request, "Gagal menyiapkan profil user.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("has_password")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    return redirectToLogin(request, "Gagal membaca status password user.");
  }

  const destination = profile?.has_password ? "/dashboard" : "/settings/set-password";
  return NextResponse.redirect(new URL(destination, request.url));
}
