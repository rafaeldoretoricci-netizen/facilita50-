import Link from "next/link";
import { getSession } from "@/lib/auth";
import FontControl from "./FontControl";

export default async function Header() {
  const { user, profile } = await getSession();
  return (
    <header className="top">
      <div className="wrap">
        <Link className="logo" href="/">Facilita <span>50+</span></Link>
        <nav className="main" aria-label="Seções">
          <Link href="/">Início</Link>
          <Link href="/#livros">Livros</Link>
          <Link href="/#comunidade">Comunidade</Link>
          <Link href="/membros">Área de membros</Link>
          {profile?.role === "admin" && <Link href="/admin">Painel</Link>}
          {user ? <Link href="/minha-conta">Minha conta</Link> : <Link href="/entrar">Entrar</Link>}
        </nav>
        <FontControl />
      </div>
    </header>
  );
}
