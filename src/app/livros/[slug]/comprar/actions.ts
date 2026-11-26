"use server";
import { redirect } from "next/navigation";
import { getBookBySlug, getSettings } from "@/lib/data";
import { env, hasMercadoPago, hasSupabase } from "@/lib/env";
import { mp } from "@/lib/mercadopago";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export type CheckoutState = { error?: string; values?: Record<string, string> };

export async function createOrder(prev: CheckoutState, form: FormData): Promise<CheckoutState> {
  const values: Record<string, string> = {};
  form.forEach((v, k) => { if (typeof v === "string") values[k] = v; });
  const r = await doCreateOrder(form);
  return r ? { ...r, values } : prev;
}

async function doCreateOrder(form: FormData): Promise<CheckoutState | undefined> {
  if (!hasSupabase || !hasMercadoPago) {
    return { error: "A loja ainda está sendo configurada. Tente novamente em breve." };
  }
  const slug = String(form.get("slug") ?? "");
  const format = form.get("format") === "digital" ? "digital" : "physical";
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const whatsapp = String(form.get("whatsapp") ?? "").trim();

  const book = await getBookBySlug(slug);
  if (!book) return { error: "Não encontramos este livro." };
  if (!name || !email.includes("@")) return { error: "Preencha seu nome e um e-mail válido." };

  const settings = await getSettings();
  const price = Number(format === "physical" ? book.price_physical : book.price_digital);
  if (!price) return { error: "Este formato não está à venda no momento." };

  let address: Record<string, string> | null = null;
  let shipping = 0;
  if (format === "physical") {
    address = {
      cep: String(form.get("cep") ?? "").trim(),
      rua: String(form.get("rua") ?? "").trim(),
      numero: String(form.get("numero") ?? "").trim(),
      complemento: String(form.get("complemento") ?? "").trim(),
      bairro: String(form.get("bairro") ?? "").trim(),
      cidade: String(form.get("cidade") ?? "").trim(),
      uf: String(form.get("uf") ?? "").trim().toUpperCase(),
    };
    if (!address.cep || !address.rua || !address.numero || !address.cidade || !address.uf) {
      return { error: "Preencha o endereço de entrega completo." };
    }
    shipping = Number(settings.shipping_flat);
  }

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const db = supabaseAdmin();
  const { data: order, error } = await db
    .from("orders")
    .insert({
      book_id: book.id,
      book_title: book.title + (book.subtitle && book.subtitle !== "Lançamento 2026" ? ` · ${book.subtitle}` : ""),
      format,
      customer_name: name,
      email,
      whatsapp,
      address,
      amount: price + shipping,
      shipping,
      user_id: user?.id ?? null,
    })
    .select()
    .single();
  if (error || !order) return { error: "Não conseguimos registrar o pedido. Tente novamente." };

  const items = [
    { id: book.slug, title: `${book.title} (${format === "physical" ? "impresso" : "digital"})`, quantity: 1, unit_price: price, currency_id: "BRL" },
  ];
  if (shipping) items.push({ id: "frete", title: "Frete", quantity: 1, unit_price: shipping, currency_id: "BRL" });

  let initPoint: string | undefined;
  try {
    const pref = await mp.preference().create({
      body: {
        items,
        payer: { name, email },
        external_reference: order.id,
        statement_descriptor: "FACILITA50",
        back_urls: {
          success: `${env.siteUrl}/compra/obrigado?pedido=${order.id}`,
          pending: `${env.siteUrl}/compra/obrigado?pedido=${order.id}&situacao=pendente`,
          failure: `${env.siteUrl}/compra/obrigado?pedido=${order.id}&situacao=falha`,
        },
        auto_return: "approved",
        notification_url: `${env.siteUrl}/api/webhooks/mercadopago`,
        payment_methods: { installments: 3 },
      },
    });
    await db.from("orders").update({ mp_preference_id: pref.id }).eq("id", order.id);
    initPoint = pref.init_point;
  } catch (e) {
    console.error("[checkout livro]", e);
  }
  if (!initPoint) return { error: "Não conseguimos abrir o pagamento agora. Tente novamente em alguns minutos." };
  redirect(initPoint);
}
