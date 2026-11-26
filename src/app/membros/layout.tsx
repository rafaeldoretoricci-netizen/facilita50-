import Link from "next/link";
import { requireMember } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MembrosLayout({ children }: { children: React.ReactNode }) {
  await requireMember();
  return (
    <div className="stage">
      <nav className="mv-subnav" aria-label="Área de membros">
        <div className="wrap">
          <Link href="/membros">Início</Link>
          <Link href="/membros/cursos">Todos os cursos</Link>
          <Link href="/minha-conta">Minha assinatura</Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
