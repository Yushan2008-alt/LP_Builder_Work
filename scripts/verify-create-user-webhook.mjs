const baseUrl = process.env.VERIFY_BASE_URL || "http://localhost:3000";
const webhookSecret = process.env.WEBHOOK_SECRET;
const emailDomain = process.env.VERIFY_EMAIL_DOMAIN || "example.com";

if (!webhookSecret) {
  console.error("❌ WEBHOOK_SECRET is required");
  process.exit(1);
}

const timestamp = Date.now();
const testEmail = `verify+${timestamp}@${emailDomain}`;
const endpoint = new URL("/api/webhooks/create-user", baseUrl).toString();

async function main() {
  console.log(`➡️  POST ${endpoint}`);
  console.log(`➡️  test email: ${testEmail}`);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-webhook-key": webhookSecret,
    },
    body: JSON.stringify({ email: testEmail }),
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status !== 201) {
    console.error(`❌ Expected status 201, got ${response.status}`);
    console.error("Response:", payload);
    process.exit(1);
  }

  if (!payload?.user?.id || !payload?.user?.email) {
    console.error("❌ Missing user.id or user.email in response");
    console.error("Response:", payload);
    process.exit(1);
  }

  if (payload.user.email.toLowerCase() !== testEmail.toLowerCase()) {
    console.error("❌ Response user.email mismatch");
    console.error("Expected:", testEmail);
    console.error("Received:", payload.user.email);
    process.exit(1);
  }

  if (payload.magic_link_email_sent !== true) {
    console.error("❌ Expected magic_link_email_sent to be true");
    console.error("Response:", payload);
    process.exit(1);
  }

  if (typeof payload.redirect_to !== "string" || payload.redirect_to.length === 0) {
    console.error("❌ Expected redirect_to as non-empty string");
    console.error("Response:", payload);
    process.exit(1);
  }

  let redirectPath;
  try {
    redirectPath = new URL(payload.redirect_to).pathname;
  } catch {
    console.error("❌ redirect_to is not a valid URL");
    console.error("Received:", payload.redirect_to);
    process.exit(1);
  }

  if (redirectPath !== "/auth/callback") {
    console.error("❌ redirect_to path must be /auth/callback");
    console.error("Received:", payload.redirect_to);
    process.exit(1);
  }

  console.log("✅ Webhook verification passed");
  console.log(
    JSON.stringify(
      {
        status: response.status,
        userId: payload.user.id,
        userEmail: payload.user.email,
        magicLinkEmailSent: payload.magic_link_email_sent,
        redirectTo: payload.redirect_to,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("❌ Verification script failed:", error);
  process.exit(1);
});
