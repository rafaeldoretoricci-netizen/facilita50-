import Link from "next/link";
import { redirect } from "next/navigation";
import { subscribeExisting } from "@/app/comunidade/assinar/actions";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { brl, dataBR } from "@/lib/format";
import { supabaseServer } from "@/lib/supabase/server";
import { cancelSubscription } from "./actions";

export const metadata = { title: "Minha conta" };
export const dynamic = "force-dynamic";

const STATUS: Record<string, [string, string]> = {
  active: ["ok", "Ativa"],
  past_due: ["warn", "Pagamento pendente"],
  pending: ["warn", "Aguardando pagamento"],
  paused: ["warn", "Pausada"],
  cancelled: ["bad", "Cancelada"],
};

export default async function MinhaConta() {
  const { user, profile, subscription } = await getSession();
  if (!user) redirect("/entrar?voltar=/minha-conta");
  const sb = await supabaseServer();
  const [{ data: payments }, settings] = await Promise.all([
    sb.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(12),
    getSettings(),
  ]);
  const st = subscription ? STATUS[subscription.status] : null;
  const active = subscription && ["active", "past_due"].includes(subscription.status);

  return (
    <section className="checkout">
      <div className="wrap" style={{ display: "grid", gap: "1.4rem" }}>
        <h2>Olá, {profile?.full_name?.split(" ")[0] ?? "que bom te ver"}!</h2>

        <div className="card">
          <h3 style={{ marginBottom: ".8rem" }}>Minha assinatura da Comunidade</h3>
          {subscription && st ? (
            <div style={{ display: "grid", gap: ".5rem" }}>
              <p>Situação: <span className={`pill ${st[0]}`}>{st[1]}</span></p>
              <p>Valor: {brl(subscription.amount)} por mês</p>
              {subscription.last_payment_date && <p>Último pagamento: {dataBR(subscription.last_payment_date)}</p>}
              {active && subscription.next_payment_date && <p>Próxima cobrança: {dataBR(subscription.next_payment_date)}</p>}
            </div>
          ) : (
            <p>Você ainda não faz parte da Comunidade. A assinatura custa {brl(settings.community_price)} por mês e pode ser cancelada quando quiser.</p>
          )}
          <div className="cta" style={{ display: "flex", gap: ".8rem", flexWrap: "wrap", marginTop: "1.2rem" }}>
            {active ? (
              <Link className="btn btn-main" href="/membros">Ir para a área de membros</Link>
            ) : (
              <form action={subscribeExisting}><button className="btn btn-main">{subscription?.status === "pending" ? "Concluir o pagamento" : "Assinar a Comunidade"}</button></form>
            )}
          </div>
          {active && (
            <details style={{ marginTop: "1.4rem" }}>
              <summary style={{ cursor: "pointer" }}>Quero cancelar minha assinatura</summary>
              <div className="notice" style={{ marginTop: ".8rem" }}>
                <p style={{ marginBottom: ".8rem" }}>Sentiremos sua falta! Ao cancelar, não haverá novas cobranças e o acesso aos conteúdos é encerrado.</p>
                <form action={cancelSubscription}><button className="btn btn-ghost">Sim, cancelar assinatura</button></form>
              </div>
            </details>
          )}
        </div>

        {payments && payments.length > 0 && (
          <div>
            <h3 style={{ marginBottom: ".8rem" }}>Meus pagamentos</h3>
            <div className="tbl"><table><thead><tr><th>Data</th><th>Descrição</th><th>Forma</th><th className="num">Valor</th></tr></thead><tbody>
              {payments.map((p) => (
                <tr key={p.id}><td>{dataBR(p.paid_at ?? p.created_at)}</td><td>{p.description}</td><td>{p.method}</td><td className="num">{brl(p.amount)}</td></tr>
              ))}
            </tbody></table></div>
          </div>
        )}

        <form action="/sair" method="post"><button className="btn btn-ghost">Sair da conta</button></form>
      </div>
    </section>
  );
}
