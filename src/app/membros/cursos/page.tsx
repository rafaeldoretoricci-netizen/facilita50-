import Link from "next/link";
import CourseTile from "@/components/CourseTile";
import { requireMember } from "@/lib/auth";
import { hasSupabase } from "@/lib/env";
import { loadCourses } from "@/lib/members";

export const metadata = { title: "Todos os cursos" };

export default async function Cursos({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const { user } = await requireMember();
  const courses = await loadCourses(user!.id);
  const cats = [...new Set(courses.map((c) => c.category))];
  const list = categoria ? courses.filter((c) => c.category === categoria) : courses;
  return (
    <div className="wrap mv-catalog">
      <h1>Todos os <span className="mv-accent">cursos</span></h1>
      <p className="mv-desc">Escolha um tema e comece quando quiser. Seu progresso fica salvo.</p>
      <div className="mv-chips">
        <Link href="/membros/cursos" aria-current={!categoria ? "page" : undefined}>Todos</Link>
        {cats.map((c) => <Link key={c} href={`/membros/cursos?categoria=${encodeURIComponent(c)}`} aria-current={categoria === c ? "page" : undefined}>{c}</Link>)}
      </div>
      {list.length === 0 ? <p className="mv-desc">Nenhum curso disponível ainda. Novidades chegam em breve!</p> : (
        <div className="mv-grid">{list.map((c, i) => <CourseTile key={c.id} c={c} i={i} />)}</div>
      )}
    </div>
  );
}
