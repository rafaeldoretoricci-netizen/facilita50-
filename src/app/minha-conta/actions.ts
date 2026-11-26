"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { mp } from "@/lib/mercadopago";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function cancelSubscription() {
  const { user, subscription } = await getSession();
  if (!user) redirect("/entrar?voltar=/minha-conta");
  if (!subscription?.mp_preapproval_id) return;
  await mp.preapproval().update({ id: subscription.mp_preapproval_id, body: { status: "cancelled" } });
  await supabaseAdmin()
    .from("subscriptions")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", subscription.id);
  revalidatePath("/minha-conta");
}
