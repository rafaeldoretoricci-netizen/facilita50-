"use client";
import { useActionState, useState } from "react";
import { brl } from "@/lib/format";
import { createOrder, type CheckoutState } from "./actions";

type Props = {
  slug: string;
  title: string;
  hasPhysical: boolean;
  hasDigital: boolean;
  pricePhysical: number;
  priceDigital: number;
  shipping: number;
  initialFormat: "physical" | "digital";
};

export default function CheckoutForm(p: Props) {
  const [format, setFormat] = useState(p.initialFormat);
  const [state, action, pending] = useActionState<CheckoutState, FormData>(createOrder, {});
  const price = format === "physical" ? p.pricePhysical : p.priceDigital;
  const frete = format === "physical" ? p.shipping : 0;

  return (
    <div className="co-grid">
      <form className="card" action={action}>
        {state.error && <p className="error" role="alert">{state.error}</p>}
        <input type="hidden" name="slug" value={p.slug} />
        <div className="field">
          <label htmlFor="format">Formato</label>
          <select id="format" name="format" value={format} onChange={(e) => setFormat(e.target.value as "physical" | "digital")}>
            {p.hasPhysical && <option value="physical">Livro impresso (entregamos na sua casa)</option>}
            {p.hasDigital && <option value="digital">Livro digital (chega no seu e-mail)</option>}
          </select>
        </div>
        <div className="field"><label htmlFor="name">Seu nome completo</label><input id="name" name="name" defaultValue={state.values?.name} required autoComplete="name" /></div>
        <div className="row2">
          <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" defaultValue={state.values?.email} type="email" required autoComplete="email" /></div>
          <div className="field"><label htmlFor="whatsapp">WhatsApp</label><input id="whatsapp" name="whatsapp" defaultValue={state.values?.whatsapp} inputMode="tel" autoComplete="tel" placeholder="(85) 90000-0000" /></div>
        </div>
        {format === "physical" && (
          <>
            <div className="row2">
              <div className="field"><label htmlFor="cep">CEP</label><input id="cep" name="cep" defaultValue={state.values?.cep} required inputMode="numeric" autoComplete="postal-code" /></div>
              <div className="field"><label htmlFor="rua">Rua</label><input id="rua" name="rua" defaultValue={state.values?.rua} required autoComplete="address-line1" /></div>
            </div>
            <div className="row2">
              <div className="field"><label htmlFor="numero">Número</label><input id="numero" name="numero" defaultValue={state.values?.numero} required /></div>
              <div className="field"><label htmlFor="complemento">Complemento</label><input id="complemento" name="complemento" defaultValue={state.values?.complemento} placeholder="Apto, bloco (se houver)" /></div>
            </div>
            <div className="row2">
              <div className="field"><label htmlFor="bairro">Bairro</label><input id="bairro" name="bairro" defaultValue={state.values?.bairro} /></div>
              <div className="field"><label htmlFor="cidade">Cidade</label><input id="cidade" name="cidade" defaultValue={state.values?.cidade} required autoComplete="address-level2" /></div>
            </div>
            <div className="field" style={{ maxWidth: 160 }}><label htmlFor="uf">Estado (UF)</label><input id="uf" name="uf" defaultValue={state.values?.uf} required maxLength={2} placeholder="CE" /></div>
          </>
        )}
        <button className="btn btn-main" style={{ width: "100%" }} disabled={pending}>
          {pending ? "Abrindo o pagamento..." : `Ir para o pagamento: ${brl(price + frete)}`}
        </button>
        <p className="example" style={{ marginTop: ".8rem" }}>Você será levado ao Mercado Pago para pagar com Pix, cartão ou boleto, com toda a segurança.</p>
      </form>
      <aside className="card summary">
        <h3>Seu pedido</h3>
        <div className="line"><span>{p.title} ({format === "physical" ? "impresso" : "digital"})</span><span>{brl(price)}</span></div>
        <div className="line"><span>Frete</span><span>{frete ? brl(frete) : "Grátis"}</span></div>
        <div className="line total"><span>Total</span><span>{brl(price + frete)}</span></div>
      </aside>
    </div>
  );
}
