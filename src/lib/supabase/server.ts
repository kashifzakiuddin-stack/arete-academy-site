import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
  Two distinct clients, used for two distinct jobs:

  * createSupabaseServerClient — acts AS THE SIGNED-IN USER (session
    from cookies). All reads of family data go through this client so
    Row Level Security is the enforcement layer, not app code.

  * createSupabaseServiceClient — the service key, server-only. Used
    ONLY to (a) read question content, which deliberately has no RLS
    read policy so answers never reach the browser, and (b) write
    attempt/mastery rows AFTER the caller's ownership of the child has
    been verified via the user-scoped client. Never expose this client
    to anything derived from request input without that check.
*/

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name} — see README-PHASE2.md`);
  }
  return value;
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component where cookies are read-only;
            // the proxy handles session refresh in that case.
          }
        },
      },
    }
  );
}

export function createSupabaseServiceClient(): SupabaseClient {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
