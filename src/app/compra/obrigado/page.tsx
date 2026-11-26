import Link from "next/link";
import { hasSupabase } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata = { title: "Pedido recebido" };
export const dynamic = "force-dynamic";

async function getOrder(id?: string) {
  if (!id || !hasSupabase || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabaseAdmin().from("orders").select("id,status,format,book_title").eq("id", id).maybeSingle();
  return data;
}

export default async function Obrigado({ searchParams }: { searchParams: Promise<{ situacao?: string; pedido?: string }> }) {
  const { situacao, pedido } = await searchParams;
  const order = await getOrder(pedido);
  const paid = order?.status === "paid";
  const msg =
    situacao === "falha"
      ? { t: "O pagamento não foi concluído", d: "Nada foi cobrado. Você pode tentar de novo, escolhendo outra forma de pagamento, se preferir.", ok: false }
      : situacao === "pendente" && !paid
        ? { t: "Pedido recebido. Aguardando o pagamento", d: "Assim que o pagamento for confirmado (boleto pode levar até 2 dias úteis), seu pedido segue. Guarde esta página: se for um livro digital, o botão para baixar aparece aqui.", ok: true }
        : { t: "Pedido confirmado. Muito obrigado!", d: order?.format === "digital" ? "Seu livro digital já pode ser baixado. Guarde esta página para baixar de novo quando quiser." : "Seu livro impresso será enviado em até 3 dias úteis para o endereço informado.", ok: true };
  return (
    <section className="checkout">
      <div className="wrap">
        <div className="card success">
          <svg viewBox="0 0 24 24" aria-hidden="true" style={msg.ok ? undefined : { stroke: "var(--bad)" }}>
            <circle cx="12" cy="12" r="10" />
            {msg.ok ? <path d="M7 12.5l3 3 7-7" /> : <path d="M8 8l8 8M16 8l-8 8" />}
          </svg>
          <h2>{msg.t}</h2>
          <p style={{ maxWidth: "48ch" }}>{msg.d}</p>
          {paid && order?.format === "digital" && (
            <a className="btn btn-main" href={`/compra/baixar/${order.id}`}>Baixar “{order.book_title}”</a>
          )}
          {!paid && order && situacao !== "falha" && <p className="example">Se o pagamento já foi feito, atualize a página em alguns instantes.</p>}
          <Link className="btn btn-ghost" href="/">Voltar para o início</Link>
        </div>
      </div>
    </section>
  );
}
