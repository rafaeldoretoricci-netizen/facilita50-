import Link from "next/link";
import { requireMember } from "@/lib/auth";
import { getBooks } from "@/lib/data";
import { youtubeId } from "@/lib/format";
import { supabaseServer } from "@/lib/supabase/server";
import type { Content } from "@/lib/types";

export const metadata = { title: "Área de membros" };
export const dynamic = "force-dynamic";

const grad = ["#5a2a44", "#1f5f8b", "#2e6b4f", "#8c3b4f", "#b0612a", "#3a2a4f"];
const kindLabel = { video: "Aula em vídeo", entrevista: "Entrevista", livro: "Livro digital", artigo: "Artigo" };

function Thumb({ c, i }: { c: Content; i: number }) {
  const yt = youtubeId(c.video_url);
  const img = c.thumbnail_url ?? (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null);
  return (
    <div className="th" style={img ? { backgroundImage: `linear-gradient(0deg,rgba(0,0,0,.6),transparent 60%),url(${img})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: `linear-gradient(150deg,${grad[i % grad.length]},#11141f)` }}>
      <span style={{ fontSize: ".75rem", letterSpacing: ".08em", textTransform: "uppercase" }}>{kindLabel[c.kind]}</span>
    </div>
  );
}

export default async function Membros() {
  const { profile } = await requireMember();
  const sb = await supabaseServer();
  const [{ data }, books] = await Promise.all([
    sb.from("contents").select("*").eq("published", true).order("position").order("created_at", { ascending: false }),
    getBooks(),
  ]);
  const contents = (data ?? []) as Content[];
  const featured = contents.find((c) => c.featured) ?? contents[0];
  const rails = new Map<string, Content[]>();
  contents.forEach((c) => rails.set(c.rail, [...(rails.get(c.rail) ?? []), c]));
  const ebooks = books.filter((b) => b.has_digital && b.ebook_path);
  const first = profile?.full_name?.split(" ")[0];

  return (
    <div className="stage">
      <section className="m-hero">
        <div className="wrap">
          <div>
            <div className="greet">Olá{first ? `, ${first}` : ""}! Que bom te ver por aqui</div>
            {featured ? (
              <>
                <h1>{featured.title}</h1>
                {featured.description && <p>{featured.description}</p>}
                <Link className="btn btn-main" href={`/membros/${featured.id}`}>▶ Assistir agora</Link>
              </>
            ) : (
              <h1>Os primeiros conteúdos chegam em breve</h1>
            )}
          </div>
          {featured && (
            <Link className="player" href={`/membros/${featured.id}`} aria-label={`Abrir ${featured.title}`}>
              <span className="play"><svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z" /></svg></span>
            </Link>
          )}
        </div>
      </section>

      {[...rails.entries()].map(([rail, items]) => (
        <div className="rail wrap" key={rail}>
          <h2>{rail}</h2>
          <div className="row">
            {items.map((c, i) => (
              <Link className="tile" href={`/membros/${c.id}`} key={c.id} style={{ textDecoration: "none" }}>
                <Thumb c={c} i={i} />
                <div className="meta">
                  <b style={{ fontSize: ".95rem" }}>{c.title}</b>
                  <span>{kindLabel[c.kind]}{c.duration_minutes ? ` · ${c.duration_minutes} min` : ""}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {ebooks.length > 0 && (
        <div className="rail wrap">
          <h2>Livros digitais</h2>
          <div className="row">
            {ebooks.map((b, i) => (
              <a className="tile book-t" href={`/membros/livro/${b.id}`} key={b.id} style={{ textDecoration: "none" }}>
                {b.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <div className="th" style={{ padding: 0 }}><img src={b.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                ) : (
                  <div className="th" style={{ background: `linear-gradient(160deg,${grad[i % grad.length]},#11141f)` }}>{b.title}</div>
                )}
                <div className="meta"><b style={{ fontSize: ".9rem" }}>{b.title}</b><span>{b.subtitle ?? "Baixar"}</span></div>
              </a>
            ))}
          </div>
        </div>
      )}
      <div style={{ paddingBottom: "3rem" }} />
    </div>
  );
}
