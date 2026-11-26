import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { hasSupabase } from "@/lib/env";
import { lessonWord, loadCourses } from "@/lib/members";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Curso({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireMember();
  const course = (await loadCourses(user!.id)).find((c) => c.id === id);
  if (!course) notFound();
  const done = new Set<string>(course.lessons.slice(0, course.done).map((l) => l.id));
  if (hasSupabase) {
    const sb = await supabaseServer();
    const { data: prog } = await sb.from("lesson_progress").select("lesson_id,completed").eq("user_id", user!.id).eq("course_id", id);
    done.clear();
    (prog ?? []).filter((p) => p.completed).forEach((p) => done.add(p.lesson_id));
  }
  const pct = course.lessons.length ? Math.round((course.done / course.lessons.length) * 100) : 0;

  return (
    <>
      <section className="mv-hero mv-hero-sm" style={course.image ? { backgroundImage: `linear-gradient(90deg,#10141f 0%,rgba(16,20,31,.88) 45%,rgba(16,20,31,.3) 100%),linear-gradient(0deg,#10141f 0%,transparent 50%),url(${course.image})` } : undefined}>
        <div className="wrap">
          <Link href="/membros" className="mv-back">← Voltar</Link>
          <div className="mv-hero-text">
            <p className="mv-eyebrow"><b>{course.category}</b>{course.level ? ` · ${course.level}` : ""}</p>
            <h1>{course.title}</h1>
            {course.description && <p className="mv-desc">{course.description}</p>}
            <p className="mv-facts"><span>{lessonWord(course.lessons.length)}</span>{course.totalMinutes > 0 && <span>{course.totalMinutes} min no total</span>}<span>{pct}% concluído</span></p>
            <div className="mv-bar mv-bar-lg"><i style={{ width: `${pct}%` }} /></div>
            {course.nextLesson && (
              <div className="mv-hero-cta">
                <Link className="btn mv-btn-gold" href={`/membros/curso/${course.id}/aula/${course.nextLesson.id}`}>▶ {course.done > 0 ? "Continuar de onde parei" : "Começar o curso"}</Link>
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="wrap mv-lessons">
        <h2>Aulas</h2>
        <ol>
          {course.lessons.map((l, i) => (
            <li key={l.id}>
              <Link href={`/membros/curso/${course.id}/aula/${l.id}`} className={done.has(l.id) ? "is-done" : ""}>
                <span className="mv-num" aria-hidden="true">{done.has(l.id) ? "✓" : i + 1}</span>
                <span className="mv-l-text"><b>{l.title}</b>{l.description && <small>{l.description}</small>}</span>
                <span className="mv-l-time">{l.duration_minutes ? `${l.duration_minutes} min` : ""}{done.has(l.id) ? " · Concluída" : ""}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
