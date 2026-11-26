import "server-only";
import { redirect } from "next/navigation";
import { hasSupabase } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";

export async function getSession() {
  if (!hasSupabase) return { user: null, profile: null, subscription: null };
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { user: null, profile: null, subscription: null };
  const [{ data: profile }, { data: subscription }] = await Promise.all([
    sb.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    sb.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  return { user, profile, subscription };
}

/** Sessão de demonstração, usada só enquanto o Supabase não está configurado. */
const DEMO_SESSION = {
  user: { id: "demo", email: "demo@facilita50.com.br" },
  profile: { full_name: "Visitante", role: "member" },
  subscription: { status: "active" },
};

export async function requireMember() {
  if (!hasSupabase) return DEMO_SESSION as unknown as Awaited<ReturnType<typeof getSession>>;
  const s = await getSession();
  if (!s.user) redirect("/entrar?voltar=/membros");
  const isAdmin = s.profile?.role === "admin";
  const active = ["active", "past_due"].includes(s.subscription?.status ?? "");
  if (!isAdmin && !active) redirect("/minha-conta");
  return s;
}

export async function requireAdmin() {
  const s = await getSession();
  if (!s.user) redirect("/entrar?voltar=/admin");
  if (s.profile?.role !== "admin") redirect("/");
  return s;
}
