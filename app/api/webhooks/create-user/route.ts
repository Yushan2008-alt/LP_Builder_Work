import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    console.error("[create-user] supabase admin init error:", error);
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
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

  // 5. Create user (no password — magic link / OTP flow)
  const { data, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email: trimmedEmail,
      email_confirm: true, // auto-confirm the email
    });

  if (createError) {
    console.error("[create-user] createUser error:", createError.message);

    // Supabase sometimes returns a specific message for duplicates
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

  // 6. Success
  return NextResponse.json(
    {
      message: "User created successfully",
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
      },
    },
    { status: 201 }
  );
}
