import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client — uses Service Role Key.
 * NEVER expose this on the client side.
 * Only use in server-side API routes / Server Actions.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
