import { NextResponse, type NextRequest } from "next/server";
import { getAuthorizedPayment, mapPreapprovalStatus, methodLabel, mp, verifyWebhook } from "@/lib/mercadopago";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Recebe os avisos do Mercado Pago (pagamentos de livros, assinaturas e mensalidades).
 * Configure em: Suas integrações > Webhooks, apontando para /api/webhooks/mercadopago
 * com os eventos "Pagamentos", "Planos e assinaturas".
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  const type: string = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic") ?? "";
  const dataId: string | null = url.searchParams.get("data.id") ?? body?.data?.id?.toString() ?? null;

  if (!verifyWebhook(req.headers, dataId)) {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }
  if (!dataId) return NextResponse.json({ ok: true });

  try {
    if (type === "payment") await handlePayment(dataId);
    else if (type === "subscription_preapproval") await handlePreapproval(dataId);
    else if (type === "subscription_authorized_payment") await handleAuthorizedPayment(dataId);
  } catch (e) {
    console.error("[webhook mercadopago]", type, dataId, e);
    // 500 faz o Mercado Pago tentar de novo mais tarde.
    return NextResponse.json({ error: "falha ao processar" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

async function handlePayment(id: string) {
  const db = supabaseAdmin();
  const p = await mp.payment().get({ id });
  const ref = p.external_reference ?? "";
  const paidAt = p.status === "approved" ? p.date_approved ?? new Date().toISOString() : null;

  // Pagamento de livro: external_reference é o id do pedido.
  const { data: order } = ref
    ? await db.from("orders").select("*").eq("id", ref).maybeSingle()
    : { data: null };

  if (order) {
    const status =
      p.status === "approved" ? "paid" :
      p.status === "refunded" || p.status === "charged_back" ? "refunded" :
      p.status === "rejected" ? "failed" :
      p.status === "cancelled" ? "cancelled" : "pending";
    await db.from("orders").update({ status, mp_payment_id: String(p.id), paid_at: paidAt }).eq("id", order.id);
    await upsertPayment({
      mp_payment_id: String(p.id),
      kind: "book",
      order_id: order.id,
      user_id: order.user_id,
      payer_name: order.customer_name,
      payer_email: order.email,
      description: `${order.book_title} (${order.format === "physical" ? "impresso" : "digital"})`,
      amount: Number(p.transaction_amount ?? order.amount),
      method: methodLabel(p.payment_type_id),
      status: p.status ?? "unknown",
      paid_at: paidAt,
      raw: p,
    });
    return;
  }

  // Mensalidade: o pagamento traz o id da assinatura.
  const preapprovalId =
    (p.metadata as Record<string, string> | undefined)?.preapproval_id ??
    (p.point_of_interaction as { transaction_data?: { subscription_id?: string } } | undefined)?.transaction_data?.subscription_id;
  if (preapprovalId) await registerSubscriptionPayment(preapprovalId, p);
}

async function handlePreapproval(id: string) {
  const db = supabaseAdmin();
  const pre = await mp.preapproval().get({ id });
  await db
    .from("subscriptions")
    .update({
      status: mapPreapprovalStatus(pre.status),
      next_payment_date: pre.next_payment_date ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("mp_preapproval_id", id);
}

async function handleAuthorizedPayment(id: string) {
  const ap = await getAuthorizedPayment(id);
  if (ap?.payment?.id) {
    const p = await mp.payment().get({ id: String(ap.payment.id) });
    await registerSubscriptionPayment(ap.preapproval_id, p);
  } else if (ap?.status === "recycling" || ap?.status === "processed") {
    // Cobrança recusada: o Mercado Pago tenta de novo. Marca como atrasada.
    if (ap.payment?.status === "rejected") {
      await supabaseAdmin().from("subscriptions").update({ status: "past_due" }).eq("mp_preapproval_id", ap.preapproval_id);
    }
  }
}

async function registerSubscriptionPayment(preapprovalId: string, p: Awaited<ReturnType<ReturnType<typeof mp.payment>["get"]>>) {
  const db = supabaseAdmin();
  const { data: sub } = await db.from("subscriptions").select("*").eq("mp_preapproval_id", preapprovalId).maybeSingle();
  if (!sub) return;
  const { data: profile } = await db.from("profiles").select("full_name").eq("id", sub.user_id).maybeSingle();
  const approved = p.status === "approved";
  const paidAt = approved ? p.date_approved ?? new Date().toISOString() : null;

  await upsertPayment({
    mp_payment_id: String(p.id),
    kind: "subscription",
    subscription_id: sub.id,
    user_id: sub.user_id,
    payer_name: profile?.full_name ?? null,
    payer_email: p.payer?.email ?? null,
    description: "Mensalidade Comunidade Facilita 50+",
    amount: Number(p.transaction_amount ?? sub.amount),
    method: methodLabel(p.payment_type_id),
    status: p.status ?? "unknown",
    paid_at: paidAt,
    raw: p,
  });

  await db
    .from("subscriptions")
    .update(
      approved
        ? { status: "active", last_payment_date: paidAt, updated_at: new Date().toISOString() }
        : p.status === "rejected"
          ? { status: "past_due", updated_at: new Date().toISOString() }
          : { updated_at: new Date().toISOString() },
    )
    .eq("id", sub.id);
}

async function upsertPayment(row: Record<string, unknown>) {
  const { error } = await supabaseAdmin().from("payments").upsert(row, { onConflict: "mp_payment_id" });
  if (error) throw error;
}
