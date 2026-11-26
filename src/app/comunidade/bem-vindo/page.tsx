import Link from "next/link";

export const metadata = { title: "Bem-vindo à Comunidade" };

export default function BemVindo() {
  return (
    <section className="checkout">
      <div className="wrap">
        <div className="card success">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M7 12.5l3 3 7-7" /></svg>
          <h2>Seja muito bem-vindo à Comunidade Facilita 50+!</h2>
          <p style={{ maxWidth: "48ch" }}>Que alegria ter você com a gente. Assim que o Mercado Pago confirmar o pagamento (normalmente leva poucos minutos), seu acesso é liberado.</p>
          <Link className="btn btn-main" href="/membros">Entrar na área de membros</Link>
        </div>
      </div>
    </section>
  );
}
