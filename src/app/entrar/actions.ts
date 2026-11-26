"use server";
import { redirect } from "next/navigation";
import { env, hasSupabase } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";

export type LoginState = { error?: string; info?: string };

const safe = (p: string) => (p.startsWith("/") && !p.startsWith("//") ? p : "/membros");

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  if (!hasSupabase) return { error: "O acesso ainda está sendo configurado." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const voltar = safe(String(form.get("voltar") ?? "/membros"));
  const sb = await supabaseServer();

  if (form.get("modo") === "link") {
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${env.siteUrl}/auth/callback?voltar=${encodeURIComponent(voltar)}` },
    });
    if (error) return { error: "Não encontramos este e-mail. Confira se digitou certinho." };
    return { info: "Pronto! Enviamos um link de acesso para o seu e-mail. Abra a mensagem e toque no botão para entrar." };
  }

  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-mail ou senha não conferem. Se esqueceu a senha, peça um link de acesso logo abaixo." };
  redirect(voltar);
}
