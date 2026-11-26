"use client";
import Link from "next/link";
import { useActionState } from "react";
import { signupAndSubscribe, type SignupState } from "./actions";

export default function SignupForm() {
  const [state, action, pending] = useActionState<SignupState, FormData>(signupAndSubscribe, {});
  return (
    <form className="card" action={action}>
      <h3 style={{ marginBottom: "1rem" }}>Crie o seu acesso</h3>
      {state.error && <p className="error" role="alert">{state.error}</p>}
      <div className="field"><label htmlFor="name">Seu nome completo</label><input id="name" name="name" defaultValue={state.values?.name} required autoComplete="name" /></div>
      <div className="row2">
        <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" defaultValue={state.values?.email} type="email" required autoComplete="email" /><span className="hint">Será o seu login.</span></div>
        <div className="field"><label htmlFor="whatsapp">WhatsApp</label><input id="whatsapp" name="whatsapp" defaultValue={state.values?.whatsapp} inputMode="tel" autoComplete="tel" placeholder="(85) 90000-0000" /><span className="hint">Para avisos e ajuda.</span></div>
      </div>
      <div className="field"><label htmlFor="password">Crie uma senha</label><input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" /><span className="hint">Pelo menos 6 letras ou números. Se esquecer, enviamos um link de acesso para o seu e-mail.</span></div>
      <button className="btn btn-main" style={{ width: "100%" }} disabled={pending}>{pending ? "Preparando o pagamento..." : "Continuar para o pagamento"}</button>
      <p className="example" style={{ marginTop: ".8rem" }}>No próximo passo você informa o cartão no Mercado Pago, com toda a segurança. A mensalidade é cobrada automaticamente todo mês e pode ser cancelada quando quiser.</p>
      <p style={{ marginTop: "1rem" }}>Já tem cadastro? <Link href="/entrar?voltar=/minha-conta">Entre na sua conta</Link></p>
    </form>
  );
}
