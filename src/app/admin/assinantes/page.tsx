import { brl, dataBR } from "@/lib/format";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata = { title: "Assinantes" };

const ST: Record<string, [string, string]> = {
  active: ["ok", "Em dia"],
  past_due: ["warn", "Pagamento atrasado"],
  pending: ["warn", "Aguardando 1º pagamento"],
  paused: ["warn", "Pausada"],
  cancelled: ["bad", "Cancelada"],
};

export default async function Assinantes({ searchParams }: { searchParams: Promise<{ situacao?: string }> }) {
  const { situacao } = await searchParams;
  // Lista com o e-mail de login: usa o cliente administrativo (a página já exige administrador).
  const db = supabaseAdmin();
  let q = db.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(500);
  if (situacao && ST[situacao]) q = q.eq("status", situacao);
  const [{ data: subs }, { data: all }] = await Promise.all([q, db.from("subscriptions").select("status")]);
  const ids = [...new Set((subs ?? []).map((s) => s.user_id))];
  const [{ data: profiles }, users] = await Promise.all([
    ids.length ? db.from("profiles").select("id,full_name,whatsapp").in("id", ids) : Promise.resolve({ data: [] as { id: string; full_name: string | null; whatsapp: string | null }[] }),
    db.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const emap = new Map((users.data?.users ?? []).map((u) => [u.id, u.email]));
  const count = (s: string) => (all ?? []).filter((x) => x.status === s).length;

  return (
    <>
      <div className="kpis">
        <a className="kpi" href="/admin/assinantes?situacao=active" style={{ color: "inherit", textDecoration: "none" }}><span>Em dia</span><b>{count("active")}</b></a>
        <a className="kpi" href="/admin/assinantes?situacao=past_due" style={{ color: "inherit", textDecoration: "none" }}><span>Com pagamento atrasado</span><b>{count("past_due")}</b></a>
        <a className="kpi" href="/admin/assinantes?situacao=pending" style={{ color: "inherit", textDecoration: "none" }}><span>Aguardando 1º pagamento</span><b>{count("pending")}</b></a>
        <a className="kpi" href="/admin/assinantes?situacao=cancelled" style={{ color: "inherit", textDecoration: "none" }}><span>Canceladas</span><b>{count("cancelled")}</b></a>
      </div>
      {situacao && <p style={{ marginBottom: "1rem" }}><a href="/admin/assinantes">Mostrar todos</a></p>}
      <div className="tbl"><table>
        <thead><tr><th>Membro</th><th>Contato</th><th className="num">Mensalidade</th><th>Desde</th><th>Último pagamento</th><th>Próxima cobrança</th><th>Situação</th></tr></thead>
        <tbody>
          {(subs ?? []).length === 0 && <tr><td colSpan={7}>Nenhum assinante aqui ainda.</td></tr>}
          {(subs ?? []).map((s) => {
            const p = pmap.get(s.user_id);
            const [cls, txt] = ST[s.status] ?? ["warn", s.status];
            return (
              <tr key={s.id}>
                <td>{p?.full_name ?? "—"}</td>
                <td style={{ fontSize: ".85rem" }}>{emap.get(s.user_id) ?? ""}{p?.whatsapp ? <><br />{p.whatsapp}</> : null}</td>
                <td className="num">{brl(s.amount)}</td>
                <td>{dataBR(s.created_at)}</td>
                <td>{dataBR(s.last_payment_date)}</td>
                <td>{["active", "past_due"].includes(s.status) ? dataBR(s.next_payment_date) : "—"}</td>
                <td><span className={`pill ${cls}`}>{txt}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
      <p className="example" style={{ marginTop: ".8rem" }}>As situações são atualizadas automaticamente pelos avisos do Mercado Pago. Quando uma cobrança é recusada, o Mercado Pago tenta de novo nos dias seguintes.</p>
    </>
  );
}
