import { brl, dataBR } from "@/lib/format";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Painel" };

const PILL: Record<string, [string, string]> = {
  approved: ["ok", "Recebido"],
  authorized: ["ok", "Recebido"],
  pending: ["warn", "Aguardando"],
  in_process: ["warn", "Em análise"],
  rejected: ["bad", "Recusado"],
  cancelled: ["bad", "Cancelado"],
  refunded: ["bad", "Devolvido"],
  charged_back: ["bad", "Contestado"],
};

export default async function AdminResumo({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const { mes } = await searchParams;
  const now = new Date();
  const [y, m] = (mes && /^\d{4}-\d{2}$/.test(mes) ? mes : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`).split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 3)).toISOString();
  const end = new Date(Date.UTC(y, m, 1, 3)).toISOString();

  const sb = await supabaseServer();
  const [{ data: payments }, { count: activeSubs }, { data: subs }] = await Promise.all([
    sb.from("payments").select("*").gte("created_at", start).lt("created_at", end).order("created_at", { ascending: false }),
    sb.from("subscriptions").select("id", { count: "exact", head: true }).in("status", ["active", "past_due"]),
    sb.from("subscriptions").select("amount").eq("status", "active"),
  ]);
  const list = payments ?? [];
  const ok = list.filter((p) => p.status === "approved");
  const sum = (a: typeof list) => a.reduce((t, p) => t + Number(p.amount), 0);
  const mrr = (subs ?? []).reduce((t, s) => t + Number(s.amount), 0);
  const label = new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;

  return (
    <>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
        <a className="tablink" href={`/admin?mes=${prev}`}>← Mês anterior</a>
        <h3 style={{ textTransform: "capitalize" }}>{label}</h3>
        <a className="tablink" href={`/admin?mes=${next}`}>Próximo mês →</a>
      </div>
      <div className="kpis">
        <div className="kpi"><span>Recebido no mês</span><b>{brl(sum(ok))}</b></div>
        <div className="kpi"><span>De assinaturas</span><b>{brl(sum(ok.filter((p) => p.kind === "subscription")))}</b></div>
        <div className="kpi"><span>De livros</span><b>{brl(sum(ok.filter((p) => p.kind === "book")))}</b></div>
        <div className="kpi"><span>Assinantes ativos</span><b>{activeSubs ?? 0}</b></div>
        <div className="kpi"><span>Receita mensal recorrente</span><b>{brl(mrr)}</b></div>
      </div>
      <div className="tbl">
        <table>
          <thead><tr><th>Data</th><th>Cliente</th><th>Item</th><th>Forma</th><th className="num">Valor</th><th>Situação</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={6}>Nenhum pagamento neste mês ainda. Eles aparecem aqui automaticamente quando o Mercado Pago confirma.</td></tr>}
            {list.map((p) => {
              const [cls, txt] = PILL[p.status] ?? ["warn", p.status];
              return (
                <tr key={p.id}>
                  <td>{dataBR(p.paid_at ?? p.created_at)}</td>
                  <td>{p.payer_name ?? p.payer_email ?? "—"}</td>
                  <td>{p.description}</td>
                  <td>{p.method}</td>
                  <td className="num">{brl(p.amount)}</td>
                  <td><span className={`pill ${cls}`}>{txt}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
