import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { youtubeId } from "@/lib/format";
import { supabaseServer } from "@/lib/supabase/server";
import type { Content } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  await requireMember();
  const { id } = await params;
  const sb = await supabaseServer();
  const { data } = await sb.from("contents").select("*").eq("id", id).maybeSingle();
  const c = data as Content | null;
  if (!c) notFound();
  const yt = youtubeId(c.video_url);
  let fileUrl: string | null = null;
  if (c.file_path) {
    const { data: signed } = await sb.storage.from("conteudos").createSignedUrl(c.file_path, 3600);
    fileUrl = signed?.signedUrl ?? null;
  }

  return (
    <section className="checkout">
      <div className="wrap" style={{ display: "grid", gap: "1.2rem" }}>
        <Link href="/membros">← Voltar para a área de membros</Link>
        <h2>{c.title}</h2>
        {yt && (
          <iframe
            className="video"
            src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0`}
            title={c.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
        {!yt && c.video_url && /\.(mp4|webm)(\?|$)/i.test(c.video_url) && (
          <video className="video" src={c.video_url} controls preload="metadata" />
        )}
        {fileUrl && c.kind !== "livro" && /\.(mp4|webm)$/i.test(c.file_path ?? "") && <video className="video" src={fileUrl} controls preload="metadata" />}
        {c.description && <p className="prose">{c.description}</p>}
        {c.body && <div className="prose">{c.body.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>}
        {fileUrl && !/\.(mp4|webm)$/i.test(c.file_path ?? "") && (
          <a className="btn btn-main" href={fileUrl} style={{ justifySelf: "start" }}>Baixar o material</a>
        )}
      </div>
    </section>
  );
}
