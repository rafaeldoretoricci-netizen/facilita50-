import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { hasSupabase } from "@/lib/env";
import { youtubeId } from "@/lib/format";
import { loadCourses } from "@/lib/members";
import { supabaseServer } from "@/lib/supabase/server";
import { setLessonDone } from "../../../../actions";

export default async function Aula({ params }: { params: Promise<{ id: string; aula: string }> }) {
  const { id, aula } = await params;
  const { user } = await requireMember();
  const course = (await loadCourses(user!.id)).find((c) => c.id === id);
  const idx = course?.lessons.findIndex((l) => l.id === aula) ?? -1;
  if (!course || idx < 0) notFound();
  const lesson = course.lessons[idx];
  const next = course.lessons[idx + 1];
  const prev = course.lessons[idx - 1];

  const done = new Set<string>(course.lessons.slice(0, course.done).map((l) => l.id));
  let fileUrl: string | null = null;
  if (hasSupabase) {
    const sb = await supabaseServer();
    // Registra que a aula foi aberta (alimenta "Continue assistindo").
    await sb.from("lesson_progress").upsert(
      { user_id: user!.id, lesson_id: lesson.id, course_id: course.id, updated_at: new Date().toISOString() },
      { onConflict: "user_id,lesson_id" },
    );
    const { data: prog } = await sb.from("lesson_progress").select("lesson_id,completed").eq("user_id", user!.id).eq("course_id", id);
    done.clear();
    (prog ?? []).filter((p) => p.completed).forEach((p) => done.add(p.lesson_id));
    if (lesson.file_path) {
      const { data } = await sb.storage.from("conteudos").createSignedUrl(lesson.file_path, 3600);
      fileUrl = data?.signedUrl ?? null;
    }
  }
  const isDone = done.has(lesson.id);
  const yt = youtubeId(lesson.video_url);
  const isVideoFile = /\.(mp4|webm)(\?|$)/i.test(lesson.file_path ?? "");

  return (
    <div className="wrap mv-watch">
      <div className="mv-watch-main">
        <Link href={`/membros/curso/${course.id}`} className="mv-back">← {course.title}</Link>
        {yt ? (
          <iframe className="video" src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1`} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : lesson.video_url && /\.(mp4|webm)(\?|$)/i.test(lesson.video_url) ? (
          <video className="video" src={lesson.video_url} controls preload="metadata" />
        ) : fileUrl && isVideoFile ? (
          <video className="video" src={fileUrl} controls preload="metadata" />
        ) : null}
        <p className="mv-eyebrow"><b>Aula {idx + 1} de {course.lessons.length}</b>{lesson.duration_minutes ? ` · ${lesson.duration_minutes} min` : ""}</p>
        <h1 className="mv-watch-title">{lesson.title}</h1>
        {lesson.description && <p className="mv-desc">{lesson.description}</p>}
        {fileUrl && !isVideoFile && <a className="btn mv-btn-dark" href={fileUrl}>Baixar material de apoio</a>}
        <div className="mv-hero-cta">
          <form action={setLessonDone}>
            <input type="hidden" name="lesson_id" value={lesson.id} />
            <input type="hidden" name="course_id" value={course.id} />
            <input type="hidden" name="done" value={isDone ? "0" : "1"} />
            {!isDone && next && <input type="hidden" name="next" value={`/membros/curso/${course.id}/aula/${next.id}`} />}
            <button className={`btn ${isDone ? "mv-btn-dark" : "mv-btn-gold"}`}>
              {isDone ? "✓ Aula concluída (desmarcar)" : next ? "Concluí esta aula, ir para a próxima" : "Concluí esta aula"}
            </button>
          </form>
          {prev && <Link className="btn mv-btn-dark" href={`/membros/curso/${course.id}/aula/${prev.id}`}>‹ Aula anterior</Link>}
          {next && isDone && <Link className="btn mv-btn-dark" href={`/membros/curso/${course.id}/aula/${next.id}`}>Próxima aula ›</Link>}
        </div>
      </div>
      <aside className="mv-watch-list" aria-label="Aulas do curso">
        <h2>Aulas do curso</h2>
        <ol>
          {course.lessons.map((l, i) => (
            <li key={l.id}>
              <Link href={`/membros/curso/${course.id}/aula/${l.id}`} aria-current={l.id === lesson.id ? "page" : undefined} className={done.has(l.id) ? "is-done" : ""}>
                <span className="mv-num" aria-hidden="true">{done.has(l.id) ? "✓" : i + 1}</span>
                <span className="mv-l-text"><b>{l.title}</b></span>
              </Link>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
