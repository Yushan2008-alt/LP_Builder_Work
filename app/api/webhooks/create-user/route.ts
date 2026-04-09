import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Resolve the site base URL dynamically.
 * - Production/Vercel: NEXT_PUBLIC_SITE_URL env var
 * - Localhost fallback: http://localhost:3000
 */
function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export async function POST(request: NextRequest) {
  // 1. Authenticate webhook key
  const webhookKey = request.headers.get("x-webhook-key");
  if (!webhookKey || webhookKey !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized: invalid or missing x-webhook-key" },
      { status: 401 }
    );
  }

  // 2. Parse body
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Bad Request: invalid JSON body" },
      { status: 400 }
    );
  }

  const { email } = body;

  // 3. Validate email
  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "Bad Request: email is required" },
      { status: 400 }
    );
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return NextResponse.json(
      { error: "Bad Request: invalid email format" },
      { status: 400 }
    );
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[create-user] supabase admin init error:", errorMessage);
    return NextResponse.json(
      { error: "Internal Server Error: service temporarily unavailable" },
      { status: 500 }
    );
  }

  // 4. Check if user already exists
  const { data: existingUsers, error: listError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    console.error("[create-user] listUsers error:", listError.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  const userExists = existingUsers.users.some(
    (u) => u.email?.toLowerCase() === trimmedEmail
  );

  if (userExists) {
    return NextResponse.json(
      { error: "Conflict: user with this email already exists" },
      { status: 409 }
    );
  }

  // 5. Create user — email_confirm:true skips the confirmation requirement
  const { data, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email: trimmedEmail,
      email_confirm: true,
    });

  if (createError) {
    console.error("[create-user] createUser error:", createError.message);
    if (createError.message.toLowerCase().includes("already been registered")) {
      return NextResponse.json(
        { error: "Conflict: user with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error: " + createError.message },
      { status: 500 }
    );
  }

  const userId = data.user.id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = supabaseAdmin as any;

  // 6. Upsert user_limits (fallback if trigger is not active)
  const { error: limitsError } = await adminAny
    .from("user_limits")
    .upsert(
      { user_id: userId, max_brands: 3, max_products: 10, max_projects: 4, tier: "free" },
      { onConflict: "user_id" }
    );

  if (limitsError) {
    console.warn("[create-user] user_limits upsert warning:", limitsError.message);
  }

  // 7. Upsert profiles baseline row
  const { error: profileError } = await adminAny
    .from("profiles")
    .upsert({ user_id: userId }, { onConflict: "user_id" });

  if (profileError) {
    console.warn("[create-user] profiles upsert warning:", profileError.message);
  }

  // 8. Generate magic link pointing to correct environment URL
  const redirectTo = `${getSiteUrl()}/auth/callback`;

  const { data: linkData, error: linkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: trimmedEmail,
      options: { redirectTo },
    });

  if (linkError) {
    console.warn("[create-user] generateLink warning:", linkError.message);
  }

  // 9. Success
  return NextResponse.json(
    {
      message: "User created successfully",
      user: {
        id: userId,
        email: data.user.email,
        created_at: data.user.created_at,
      },
      user_limits_created: !limitsError,
      profile_created: !profileError,
      // magic_link: embed this in your branded email (expires per Supabase OTP setting)
      magic_link: linkData?.properties?.action_link ?? null,
      redirect_to: redirectTo,
    },
    { status: 201 }
  );
}
