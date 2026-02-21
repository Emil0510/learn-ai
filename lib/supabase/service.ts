import { createClient } from "@supabase/supabase-js";

/**
 * Service role client for server-side operations that bypass RLS.
 * Use ONLY on the server, never expose to client.
 * Perfect for storage uploads, admin operations, etc.
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase service credentials. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local"
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
