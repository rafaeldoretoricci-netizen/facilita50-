import "server-only";
import crypto from "node:crypto";
import { MercadoPagoConfig, Payment, PreApproval, Preference } from "mercadopago";
import { env } from "@/lib/env";

function client() {
  if (!env.mpAccessToken) throw new Error("Mercado Pago não configurado");
  return new MercadoPagoConfig({ accessToken: env.mpAccessToken, options: { timeout: 10000 } });
}

export const mp = {
  preference: () => new Preference(client()),
  preapproval: () => new PreApproval(client()),
  payment: () => new Payment(client()),
};

/** Busca uma cobrança de assinatura (authorized_payment), que o SDK não cobre. */
export async function getAuthorizedPayment(id: string) {
  const r = await fetch(`https://api.mercadopago.com/authorized_payments/${id}`, {
    headers: { Authorization: `Bearer ${env.mpAccessToken}` },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`authorized_payments ${id}: ${r.status}`);
  return r.json();
}

/**
 * Confere a assinatura secreta da notificação (cabeçalho x-signature).
 * Manual: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 */
export function verifyWebhook(headers: Headers, dataId: string | null): boolean {
  if (!env.mpWebhookSecret) return false;
  const sig = headers.get("x-signature") ?? "";
  const requestId = headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(
    sig.split(",").map((p) => p.trim().split("=", 2) as [string, string]),
  );
  if (!parts.ts || !parts.v1) return false;
  let manifest = "";
  if (dataId) manifest += `id:${/^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${parts.ts};`;
  const expected = crypto.createHmac("sha256", env.mpWebhookSecret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Traduz a situação da assinatura do Mercado Pago para a do sistema. */
export function mapPreapprovalStatus(s: string | undefined) {
  switch (s) {
    case "authorized":
      return "active";
    case "paused":
      return "paused";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}

export const methodLabel = (id?: string | null) =>
  ({ pix: "Pix", bank_transfer: "Pix", credit_card: "Cartão de crédito", debit_card: "Cartão de débito", ticket: "Boleto", account_money: "Saldo Mercado Pago" } as Record<string, string>)[id ?? ""] ?? (id || "—");
