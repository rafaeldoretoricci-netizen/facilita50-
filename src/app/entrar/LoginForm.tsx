"use client";
import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export default function LoginForm({ voltar }: { voltar: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form className="card" action={action} style={{ maxWidth: 560 }}>
      {state.error && <p className="error" role="alert">{state.error}</p>}
      {state.info && <p className="notice" role="status">{state.info}</p>}
      <input type="hidden" name="voltar" value={voltar} />
      <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
      <div className="field"><label htmlFor="password">Senha</label><input id="password" name="password" type="password" autoComplete="current-password" /></div>
      <button className="btn btn-main" style={{ width: "100%" }} name="modo" value="senha" disabled={pending}>Entrar</button>
      <p style={{ margin: "1.2rem 0 .6rem" }}>Esqueceu a senha? Sem problema:</p>
      <button className="btn btn-ghost" style={{ width: "100%" }} name="modo" value="link" formNoValidate disabled={pending}>Receber um link de acesso no meu e-mail</button>
    </form>
  );
}
