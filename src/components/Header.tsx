import Link from "next/link";
import { getSession } from "@/lib/auth";
import FontControl from "./FontControl";

export default async function Header() {
  const { user, profile } = await getSession();
  return (
    <>
      <div className="brand-banner">
        <div className="wrap">
          <Link className="brand-logo" href="/" aria-label="Facilita 50+, página inicial">
            Facilita <span>50+</span>
          </Link>
          <p className="brand-tagline">Educação tecnológica acessível e segura para todas as idades</p>
          <FontControl />
        </div>
      </div>
      <header className="top site-nav">
        <div className="wrap">
          <nav className="main" aria-label="Seções">
            <Link href="/">Início</Link>
            <Link href="/#livros">Livros</Link>
            <Link href="/#comunidade">Comunidade</Link>
            {profile?.role === "admin" && <Link href="/admin">Painel</Link>}
            {user ? <Link href="/membros">Minha área</Link> : <Link href="/entrar">Entrar</Link>}
          </nav>
        </div>
      </header>
    </>
  );
}
