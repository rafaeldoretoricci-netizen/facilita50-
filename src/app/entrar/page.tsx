import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata = { title: "Entrar" };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ voltar?: string }> }) {
  const { voltar } = await searchParams;
  return (
    <section className="checkout">
      <div className="wrap">
        <h2 style={{ marginBottom: "1.2rem" }}>Entrar na sua conta</h2>
        <LoginForm voltar={voltar ?? "/membros"} />
        <p style={{ marginTop: "1.2rem" }}>Ainda não faz parte? <Link href="/comunidade/assinar">Conheça a Comunidade Facilita 50+</Link></p>
      </div>
    </section>
  );
}
