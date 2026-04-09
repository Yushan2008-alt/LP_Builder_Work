import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: { email?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad Request: invalid JSON body" }, { status: 400 });
  }

  const normalizedEmail = body.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return NextResponse.json({ error: "Bad Request: email is required" }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return NextResponse.json({ error: "Bad Request: invalid email format" }, { status: 400 });
  }

  const supabase = await createClient();
  const callbackUrl = new URL("/auth/callback", request.url).toString();

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      emailRedirectTo: callbackUrl,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Magic link sent", redirectTo: callbackUrl },
    { status: 200 }
  );
}
