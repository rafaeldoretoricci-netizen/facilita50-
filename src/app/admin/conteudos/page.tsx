import Uploader from "@/components/Uploader";
import { supabaseServer } from "@/lib/supabase/server";
import type { Content } from "@/lib/types";
import { deleteContent, saveContent, toggleContent } from "../actions";

export const metadata = { title: "Conteúdos" };

const KIND = { video: "Aula em vídeo", entrevista: "Entrevista", livro: "Livro digital", artigo: "Artigo" };

export default async function Conteudos() {
  const sb = await supabaseServer();
  const { data } = await sb.from("contents").select("*").order("rail").order("position").order("created_at", { ascending: false });
  const list = (data ?? []) as Content[];
  const rails = [...new Set(list.map((c) => c.rail))];

  return (
    <div style={{ display: "grid", gap: "1.4rem" }}>
      <form action={saveContent} className="card admin-form">
        <h3 style={{ marginBottom: "1rem" }}>Publicar conteúdo na área de membros</h3>
        <div className="row2">
          <div className="field"><label htmlFor="kind">Tipo</label>
            <select id="kind" name="kind" defaultValue="video">
              {Object.entries(KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="field"><label htmlFor="rail">Fileira (onde aparece)</label><input id="rail" name="rail" list="rails" placeholder="Ex.: Celular na Prática" /><datalist id="rails">{rails.map((r) => <option key={r} value={r} />)}</datalist><span className="hint">Use o nome do curso para agrupar as aulas. Em branco: fileira padrão do tipo.</span></div>
        </div>
        <div className="field"><label htmlFor="title">Título</label><input id="title" name="title" required placeholder="Ex.: Aula 1 · Conhecendo o seu celular" /></div>
        <div className="field"><label htmlFor="description">Descrição curta</label><textarea id="description" name="description" style={{ minHeight: 80 }} /></div>
        <div className="row2">
          <div className="field"><label htmlFor="video_url">Link do vídeo</label><input id="video_url" name="video_url" placeholder="https://youtu.be/..." /><span className="hint">Dica: publique no YouTube como “Não listado” e cole o link aqui.</span></div>
          <div className="field"><label htmlFor="duration_minutes">Duração (minutos)</label><input id="duration_minutes" name="duration_minutes" inputMode="numeric" /></div>
        </div>
        <div className="field"><label htmlFor="body">Texto (para artigos)</label><textarea id="body" name="body" placeholder="Deixe uma linha em branco entre os parágrafos." /></div>
        <div className="row2">
          <Uploader bucket="conteudos" name="file_path" label="Arquivo (PDF, apostila ou vídeo)" accept=".pdf,.epub,video/mp4,video/webm" hint="Opcional. Fica protegido, só membros acessam." />
          <Uploader bucket="capas" name="thumbnail_url" label="Imagem de capa" accept="image/*" hint="Opcional. Para vídeos do YouTube usamos a imagem do próprio vídeo." />
        </div>
        <label className="check"><input type="checkbox" name="featured" /> Destacar no topo da área de membros</label>
        <button className="btn btn-main" style={{ justifySelf: "start" }}>Publicar</button>
      </form>

      <div className="tbl"><table>
        <thead><tr><th>Conteúdo</th><th>Tipo</th><th>Fileira</th><th>Situação</th><th>Ações</th></tr></thead>
        <tbody>
          {list.length === 0 && <tr><td colSpan={5}>Nenhum conteúdo publicado ainda.</td></tr>}
          {list.map((c) => (
            <tr key={c.id}>
              <td>{c.featured && "★ "}{c.title}</td>
              <td>{KIND[c.kind]}</td>
              <td>{c.rail}</td>
              <td><span className={`pill ${c.published ? "ok" : "warn"}`}>{c.published ? "Publicado" : "Oculto"}</span></td>
              <td style={{ display: "flex", gap: ".8rem", flexWrap: "wrap" }}>
                <form action={toggleContent}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="field" value="published" /><input type="hidden" name="value" value={c.published ? "0" : "1"} /><button className="linkbtn">{c.published ? "Ocultar" : "Publicar"}</button></form>
                {!c.featured && <form action={toggleContent}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="field" value="featured" /><input type="hidden" name="value" value="1" /><button className="linkbtn">Destacar</button></form>}
                <details><summary className="linkbtn" style={{ cursor: "pointer" }}>Excluir</summary><form action={deleteContent}><input type="hidden" name="id" value={c.id} /><button className="linkbtn">Confirmar exclusão</button></form></details>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
