import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/** Cliente com permissão total. Use só no servidor (webhooks e ações do sistema). */
export function supabaseAdmin() {
  if (!env.supabaseUrl || !env.supabaseServiceKey) throw new Error("Supabase não configurado");
  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
