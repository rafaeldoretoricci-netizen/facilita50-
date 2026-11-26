import Link from "next/link";
import CourseTile from "@/components/CourseTile";
import Rail from "@/components/Rail";
import { requireMember } from "@/lib/auth";
import { getBooks } from "@/lib/data";
import { lessonWord, loadCourses } from "@/lib/members";
import { supabaseServer } from "@/lib/supabase/server";
import type { Content } from "@/lib/types";

export const metadata = { title: "Área de membros" };

const grad = ["#5a2a44", "#1f5f8b", "#2e6b4f", "#8c3b4f", "#b0612a", "#3a2a4f"];

function Accent({ text }: { text: string }) {
  const words = text.split(" ");
  if (words.length < 2) return <>{text}</>;
  return <>{words.slice(0, -1).join(" ")} <span className="mv-accent">{words.at(-1)}</span></>;
}

export default async function Membros() {
  const { user, profile } = await requireMember();
  const [courses, books, extra] = await Promise.all([
    loadCourses(user!.id),
    getBooks(),
    supabaseServer().then((sb) => sb.from("contents").select("*").eq("published", true).in("kind", ["artigo", "livro"]).order("created_at", { ascending: false })).then((r) => r.data),
  ]);
  const featured = courses.find((c) => c.featured) ?? courses[0];
  const watching = courses.filter((c) => c.lastActivity && c.done < c.lessons.length).sort((a, b) => (b.lastActivity! > a.lastActivity! ? 1 : -1));
  const newest = [...courses].sort((a, b) => (b.created_at > a.created_at ? 1 : -1)).slice(0, 10);
  const categories = [...new Set(courses.map((c) => c.category))];
  const ebooks = books.filter((b) => b.has_digital && b.ebook_path);
  const articles = ((extra ?? []) as Content[]).filter((c) => c.kind === "artigo");
  const first = profile?.full_name?.split(" ")[0];

  return (
    <>
      <section className="mv-hero" style={featured?.image ? { backgroundImage: `linear-gradient(90deg,#10141f 0%,rgba(16,20,31,.85) 40%,rgba(16,20,31,.2) 100%),linear-gradient(0deg,#10141f 0%,transparent 40%),url(${featured.image})` } : undefined}>
        <div className="wrap">
          <p className="mv-hello">Olá{first ? `, ${first}` : ""}! Que bom te ver por aqui.</p>
          {featured ? (
            <div className="mv-hero-text">
              <p className="mv-eyebrow"><b>Em destaque</b> · {featured.category}</p>
              <h1><Accent text={featured.title} /></h1>
              {featured.description && <p className="mv-desc">{featured.description}</p>}
              <p className="mv-facts">
                <span>{lessonWord(featured.lessons.length)}</span>
                {featured.totalMinutes > 0 && <span>{featured.totalMinutes} min</span>}
                {featured.level && <span>{featured.level}</span>}
                {featured.done > 0 && <span>{featured.done} de {featured.lessons.length} concluídas</span>}
              </p>
              <div className="mv-hero-cta">
                {featured.nextLesson && (
                  <Link className="btn mv-btn-gold" href={`/membros/curso/${featured.id}/aula/${featured.nextLesson.id}`}>
                    ▶ {featured.done > 0 ? "Continuar assistindo" : "Assistir agora"}
                  </Link>
                )}
                <Link className="btn mv-btn-dark" href={`/membros/curso/${featured.id}`}>ⓘ Mais informações</Link>
              </div>
            </div>
          ) : (
            <div className="mv-hero-text"><h1>Os primeiros cursos chegam em <span className="mv-accent">breve</span></h1><p className="mv-desc">Fique de olho: avisaremos por e-mail e WhatsApp.</p></div>
          )}
        </div>
      </section>

      <div className="wrap mv-rails">
        {watching.length > 0 && (
          <Rail title="Continue assistindo">{watching.map((c, i) => <CourseTile key={c.id} c={c} i={i} showProgress />)}</Rail>
        )}
        {newest.length > 0 && <Rail title="Novidades na Comunidade">{newest.map((c, i) => <CourseTile key={c.id} c={c} i={i} />)}</Rail>}
        {categories.map((cat) => (
          <Rail key={cat} title={cat}>{courses.filter((c) => c.category === cat).map((c, i) => <CourseTile key={c.id} c={c} i={i} />)}</Rail>
        ))}
        {ebooks.length > 0 && (
          <Rail title="Livros digitais">
            {ebooks.map((b, i) => (
              <a className="mv-tile mv-tile-book" href={`/membros/livro/${b.id}`} key={b.id}>
                <div className="mv-thumb mv-thumb-book" style={b.cover_url ? { backgroundImage: `url(${b.cover_url})` } : { background: `linear-gradient(160deg,${grad[i % grad.length]},#11141f)` }}>
                  {!b.cover_url && <b className="mv-thumb-title">{b.title}</b>}
                </div>
                <div className="mv-meta"><b>{b.title}</b><span>{b.subtitle ?? ""}</span><small>Ler ou baixar</small></div>
              </a>
            ))}
          </Rail>
        )}
        {articles.length > 0 && (
          <Rail title="Artigos para ler com calma">
            {articles.map((a, i) => (
              <Link className="mv-tile" href={`/membros/${a.id}`} key={a.id}>
                <div className="mv-thumb" style={a.thumbnail_url ? { backgroundImage: `url(${a.thumbnail_url})` } : { background: `linear-gradient(150deg,${grad[(i + 2) % grad.length]},#11141f)` }}>
                  <span className="mv-badge">Artigo</span>
                  {!a.thumbnail_url && <b className="mv-thumb-title">{a.title}</b>}
                </div>
                <div className="mv-meta"><b>{a.title}</b><span>{a.description ?? ""}</span>{a.duration_minutes ? <small>Leitura de {a.duration_minutes} min</small> : null}</div>
              </Link>
            ))}
          </Rail>
        )}
      </div>
    </>
  );
}
