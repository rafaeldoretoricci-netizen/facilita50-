import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TABS = [
  ["/admin", "Resumo e pagamentos"],
  ["/admin/vitrine", "Vitrine de livros"],
  ["/admin/pedidos", "Pedidos de livros"],
  ["/admin/cursos", "Cursos e aulas"],
  ["/admin/conteudos", "Artigos e materiais"],
  ["/admin/assinantes", "Assinantes"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <section className="admin">
      <div className="wrap">
        <h2>Painel do administrador</h2>
        <nav className="tabs" aria-label="Seções do painel">
          {TABS.map(([href, label]) => (
            <Link key={href} href={href} className="tablink">{label}</Link>
          ))}
        </nav>
        {children}
      </div>
    </section>
  );
}
