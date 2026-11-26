import { brl, dataBR } from "@/lib/format";
import { supabaseServer } from "@/lib/supabase/server";
import { markShipped } from "../actions";

export const metadata = { title: "Pedidos" };

const ST: Record<string, [string, string]> = { paid: ["ok", "Pago"], pending: ["warn", "Aguardando"], failed: ["bad", "Recusado"], cancelled: ["bad", "Cancelado"], refunded: ["bad", "Devolvido"] };

export default async function Pedidos() {
  const sb = await supabaseServer();
  const { data: orders } = await sb.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  const toShip = (orders ?? []).filter((o) => o.status === "paid" && o.format === "physical" && !o.shipped_at);
  return (
    <>
      <div className="kpis">
        <div className="kpi"><span>Impressos para enviar</span><b>{toShip.length}</b></div>
        <div className="kpi"><span>Pedidos pagos (últimos 200)</span><b>{(orders ?? []).filter((o) => o.status === "paid").length}</b></div>
      </div>
      <div className="tbl"><table>
        <thead><tr><th>Data</th><th>Cliente</th><th>Livro</th><th>Entrega</th><th className="num">Total</th><th>Situação</th><th>Envio</th></tr></thead>
        <tbody>
          {(orders ?? []).length === 0 && <tr><td colSpan={7}>Nenhum pedido ainda.</td></tr>}
          {(orders ?? []).map((o) => {
            const [cls, txt] = ST[o.status] ?? ["warn", o.status];
            const a = o.address as Record<string, string> | null;
            return (
              <tr key={o.id}>
                <td>{dataBR(o.created_at)}</td>
                <td>{o.customer_name}<br /><span style={{ fontSize: ".8rem", color: "var(--muted)" }}>{o.email}{o.whatsapp ? ` · ${o.whatsapp}` : ""}</span></td>
                <td>{o.book_title} ({o.format === "physical" ? "impresso" : "digital"})</td>
                <td style={{ fontSize: ".85rem" }}>{a ? `${a.rua}, ${a.numero}${a.complemento ? " " + a.complemento : ""} · ${a.bairro ?? ""} · ${a.cidade}/${a.uf} · CEP ${a.cep}` : "Download"}</td>
                <td className="num">{brl(o.amount)}</td>
                <td><span className={`pill ${cls}`}>{txt}</span></td>
                <td>
                  {o.format === "physical" && o.status === "paid" && (o.shipped_at ? `Enviado ${dataBR(o.shipped_at)}` : (
                    <form action={markShipped}><input type="hidden" name="id" value={o.id} /><button className="linkbtn">Marcar como enviado</button></form>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
    </>
  );
}
