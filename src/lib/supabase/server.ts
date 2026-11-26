import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, hasSupabase } from "@/lib/env";

/** Cliente do Supabase com a sessão de quem está acessando (respeita as regras de segurança). */
export async function supabaseServer() {
  if (!hasSupabase) throw new Error("Supabase não configurado");
  const store = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Em Server Components os cookies são só leitura; o proxy renova a sessão.
        }
      },
    },
  });
}
