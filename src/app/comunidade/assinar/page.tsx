import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { brl } from "@/lib/format";
import SignupForm from "./SignupForm";

export const metadata = { title: "Assinar a Comunidade" };
export const dynamic = "force-dynamic";

export default async function Assinar() {
  const [{ user }, settings] = await Promise.all([getSession(), getSettings()]);
  if (user) redirect("/minha-conta");
  return (
    <section className="checkout">
      <div className="wrap">
        <span className="tag">Comunidade Facilita 50+</span>
        <h2 style={{ margin: ".8rem 0 1.2rem" }}>Faça parte em 2 passos simples</h2>
        <div className="steps"><span className="on">1. Seus dados</span><span>2. Pagamento no Mercado Pago</span></div>
        <div className="co-grid">
          <SignupForm />
          <aside className="card summary">
            <h3>Sua assinatura</h3>
            <div className="line"><span>Comunidade Facilita 50+</span><span>{brl(settings.community_price)}/mês</span></div>
            <div className="line"><span>Primeira cobrança</span><span>Hoje</span></div>
            <div className="line"><span>Cancelamento</span><span>Quando quiser</span></div>
          </aside>
        </div>
      </div>
    </section>
  );
}
