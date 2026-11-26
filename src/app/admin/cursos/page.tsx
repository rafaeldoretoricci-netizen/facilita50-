import Uploader from "@/components/Uploader";
import { supabaseServer } from "@/lib/supabase/server";
import type { Course, Lesson } from "@/lib/types";
import { addLesson, deleteCourse, deleteLesson, moveLesson, saveCourse, toggleCourse } from "../actions";

export const metadata = { title: "Cursos" };

function CourseForm({ c, categories }: { c?: Course; categories: string[] }) {
  const k = c?.id ?? "novo";
  return (
    <form action={saveCourse} className="admin-form">
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="row2">
        <div className="field"><label htmlFor={`ct-${k}`}>Nome do curso</label><input id={`ct-${k}`} name="title" required defaultValue={c?.title} placeholder="Ex.: WhatsApp sem medo" /></div>
        <div className="field"><label htmlFor={`cs-${k}`}>Frase curta</label><input id={`cs-${k}`} name="subtitle" defaultValue={c?.subtitle ?? ""} placeholder="Ex.: Mensagens, fotos e chamadas" /></div>
      </div>
      <div className="field"><label htmlFor={`cd-${k}`}>Descrição</label><textarea id={`cd-${k}`} name="description" defaultValue={c?.description ?? ""} style={{ minHeight: 90 }} /></div>
      <div className="row2">
        <div className="field"><label htmlFor={`cc-${k}`}>Fileira (categoria)</label><input id={`cc-${k}`} name="category" list="cats" defaultValue={c?.category ?? ""} placeholder="Ex.: Celular, Segurança, Entrevistas" /><datalist id="cats">{categories.map((x) => <option key={x} value={x} />)}</datalist></div>
        <div className="field"><label htmlFor={`cl-${k}`}>Nível</label><select id={`cl-${k}`} name="level" defaultValue={c?.level ?? "Iniciante"}><option>Iniciante</option><option>Intermediário</option><option>Avançado</option></select></div>
      </div>
      <Uploader bucket="capas" name="cover_url" label="Imagem de capa (horizontal)" accept="image/*" hint={c?.cover_url ? "Já tem capa. Envie outra só para trocar." : "Opcional. Sem imagem, usamos a miniatura do 1º vídeo do YouTube."} />
      <label className="check"><input type="checkbox" name="featured" defaultChecked={c?.featured} /> Mostrar no destaque do topo</label>
      <button className="btn btn-main" style={{ justifySelf: "start" }}>{c ? "Salvar curso" : "Criar curso"}</button>
    </form>
  );
}

export default async function Cursos() {
  const sb = await supabaseServer();
  const [{ data: cs }, { data: ls }] = await Promise.all([
    sb.from("courses").select("*").order("category").order("position").order("created_at"),
    sb.from("lessons").select("*").order("position"),
  ]);
  const courses = (cs ?? []) as Course[];
  const lessons = (ls ?? []) as Lesson[];
  const categories = [...new Set(courses.map((c) => c.category))];

  return (
    <div style={{ display: "grid", gap: "1.4rem" }}>
      <div className="card"><h3 style={{ marginBottom: "1rem" }}>Novo curso</h3><CourseForm categories={categories} /></div>
      {courses.length === 0 && <p>Nenhum curso ainda. Crie o primeiro acima e depois adicione as aulas.</p>}
      {courses.map((c) => {
        const mine = lessons.filter((l) => l.course_id === c.id);
        return (
          <div className="card" key={c.id}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <h3>{c.featured && "★ "}{c.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>{c.category} · {mine.length} aulas · <span className={`pill ${c.published ? "ok" : "warn"}`}>{c.published ? "Publicado" : "Oculto"}</span></p>
              </div>
              <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap" }}>
                <form action={toggleCourse}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="field" value="published" /><input type="hidden" name="value" value={c.published ? "0" : "1"} /><button className="linkbtn">{c.published ? "Ocultar" : "Publicar"}</button></form>
                {!c.featured && <form action={toggleCourse}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="field" value="featured" /><input type="hidden" name="value" value="1" /><button className="linkbtn">Pôr no destaque</button></form>}
                <details><summary className="linkbtn" style={{ cursor: "pointer" }}>Excluir curso</summary><form action={deleteCourse}><input type="hidden" name="id" value={c.id} /><button className="linkbtn">Confirmar: excluir curso e aulas</button></form></details>
              </div>
            </div>

            <ol style={{ margin: "1rem 0", paddingLeft: "1.4rem", display: "grid", gap: ".4rem" }}>
              {mine.map((l, i) => (
                <li key={l.id}>
                  <span>{l.title}{l.duration_minutes ? ` · ${l.duration_minutes} min` : ""}{l.video_url ? "" : l.file_path ? " · arquivo" : " · sem vídeo"}</span>{" "}
                  <form action={moveLesson} className="inline"><input type="hidden" name="id" value={l.id} /><input type="hidden" name="course_id" value={c.id} /><input type="hidden" name="dir" value="up" /><button className="linkbtn" disabled={i === 0} aria-label="Subir aula">↑</button></form>{" "}
                  <form action={moveLesson} className="inline"><input type="hidden" name="id" value={l.id} /><input type="hidden" name="course_id" value={c.id} /><input type="hidden" name="dir" value="down" /><button className="linkbtn" disabled={i === mine.length - 1} aria-label="Descer aula">↓</button></form>{" "}
                  <form action={deleteLesson} className="inline"><input type="hidden" name="id" value={l.id} /><button className="linkbtn">remover</button></form>
                </li>
              ))}
            </ol>

            <details>
              <summary style={{ cursor: "pointer", fontWeight: 700 }}>+ Adicionar aula</summary>
              <form action={addLesson} className="admin-form" style={{ marginTop: "1rem" }}>
                <input type="hidden" name="course_id" value={c.id} />
                <div className="row2">
                  <div className="field"><label htmlFor={`lt-${c.id}`}>Título da aula</label><input id={`lt-${c.id}`} name="title" required placeholder={`Aula ${mine.length + 1}`} /></div>
                  <div className="field"><label htmlFor={`ld-${c.id}`}>Duração (minutos)</label><input id={`ld-${c.id}`} name="duration_minutes" inputMode="numeric" /></div>
                </div>
                <div className="field"><label htmlFor={`lv-${c.id}`}>Link do vídeo</label><input id={`lv-${c.id}`} name="video_url" placeholder="https://youtu.be/... (não listado)" /></div>
                <div className="field"><label htmlFor={`lx-${c.id}`}>Resumo da aula</label><textarea id={`lx-${c.id}`} name="description" style={{ minHeight: 70 }} /></div>
                <Uploader bucket="conteudos" name="file_path" label="Material de apoio ou vídeo (opcional)" accept=".pdf,video/mp4,video/webm" />
                <button className="btn btn-main" style={{ justifySelf: "start" }}>Adicionar aula</button>
              </form>
            </details>
            <details style={{ marginTop: ".6rem" }}><summary style={{ cursor: "pointer" }}>Editar dados do curso</summary><div style={{ marginTop: "1rem" }}><CourseForm c={c} categories={categories} /></div></details>
          </div>
        );
      })}
    </div>
  );
}
