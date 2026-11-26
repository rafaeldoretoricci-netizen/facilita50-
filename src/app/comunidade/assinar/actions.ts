"use server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { env, hasMercadoPago, hasSupabase } from "@/lib/env";
import { startSubscription } from "@/lib/subscriptions";
import { supabaseServer } from "@/lib/supabase/server";

export type SignupState = { error?: string; info?: string; values?: Record<string, string> };

export async function signupAndSubscribe(prev: SignupState, form: FormData): Promise<SignupState> {
  const values = { name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), whatsapp: String(form.get("whatsapp") ?? "") };
  const r = await doSignup(form);
  return r ? { ...r, values } : prev;
}

async function doSignup(form: FormData): Promise<SignupState | undefined> {
  if (!hasSupabase || !hasMercadoPago) return { error: "As inscrições abrem em breve. Volte daqui a pouquinho!" };

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const whatsapp = String(form.get("whatsapp") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!name || !email.includes("@")) return { error: "Preencha seu nome e um e-mail válido." };
  if (password.length < 6) return { error: "A senha precisa ter pelo menos 6 letras ou números." };

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, whatsapp }, emailRedirectTo: `${env.siteUrl}/auth/callback?voltar=/minha-conta` },
  });
  if (error) {
    if (/registered|already/i.test(error.message)) {
      return { error: "Este e-mail já tem cadastro. Entre na sua conta para assinar." };
    }
    return { error: "Não conseguimos criar seu acesso. Confira os dados e tente de novo." };
  }
  // O Supabase devolve um usuário sem identidades quando o e-mail já existe.
  if (!data.user || data.user.identities?.length === 0) {
    return { error: "Este e-mail já tem cadastro. Entre na sua conta para assinar." };
  }

  let link: string;
  try {
    link = await startSubscription(data.user.id, email);
  } catch (e) {
    console.error("[assinatura]", e);
    return { error: "Seu acesso foi criado, mas não conseguimos abrir o pagamento. Entre na sua conta e clique em “Assinar”." };
  }
  redirect(link);
}

/** Para quem já tem conta e ainda não assinou (ou cancelou). */
export async function subscribeExisting() {
  const { user, subscription } = await getSession();
  if (!user?.email) redirect("/entrar?voltar=/minha-conta");
  if (subscription && ["active", "past_due"].includes(subscription.status)) redirect("/membros");
  const link = await startSubscription(user.id, user.email);
  redirect(link);
}
