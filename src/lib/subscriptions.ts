import "server-only";
import { env } from "@/lib/env";
import { mp } from "@/lib/mercadopago";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSettings } from "@/lib/data";

/**
 * Cria a assinatura mensal no Mercado Pago e devolve o link onde a pessoa
 * informa o cartão. O acesso é liberado quando o Mercado Pago avisa que foi autorizada.
 */
export async function startSubscription(userId: string, email: string): Promise<string> {
  const settings = await getSettings();
  const amount = Number(settings.community_price);
  const db = supabaseAdmin();

  const pre = await mp.preapproval().create({
    body: {
      reason: "Comunidade Facilita 50+ (mensal)",
      external_reference: userId,
      payer_email: email,
      back_url: `${env.siteUrl}/comunidade/bem-vindo`,
      status: "pending",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: amount,
        currency_id: "BRL",
      },
    },
  });

  await db.from("subscriptions").insert({
    user_id: userId,
    status: "pending",
    amount,
    mp_preapproval_id: pre.id,
  });

  if (!pre.init_point) throw new Error("Mercado Pago não devolveu o link de pagamento");
  return pre.init_point;
}
