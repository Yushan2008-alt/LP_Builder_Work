import { createClient, SupabaseClient } from "@supabase/supabase-js";

type AdminDatabase = {
  public: {
    Tables: {
      user_limits: {
        Row: {
          user_id: string;
          max_brands: number;
          max_products: number;
          max_projects: number;
          tier: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          max_brands?: number;
          max_products?: number;
          max_projects?: number;
          tier?: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          max_brands?: number;
          max_products?: number;
          max_projects?: number;
          tier?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          user_id: string;
          has_password: boolean;
          tier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          has_password?: boolean;
          tier?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          has_password?: boolean;
          tier?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

/**
 * Supabase Admin Client — uses Service Role Key.
 * NEVER expose this on the client side.
 * Only use in server-side API routes / Server Actions.
 */
let adminClient: SupabaseClient<AdminDatabase> | null = null;

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    const missingVars: string[] = [];
    if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!serviceRoleKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");

    throw new Error(
      `Missing Supabase admin environment variables: ${missingVars.join(", ")}`
    );
  }

  adminClient = createClient<AdminDatabase>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
