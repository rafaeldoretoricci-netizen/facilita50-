import "server-only";
import { hasSupabase } from "@/lib/env";
import { youtubeId } from "@/lib/format";
import { supabaseServer } from "@/lib/supabase/server";
import type { Course, Lesson } from "@/lib/types";

export type CourseCard = Course & {
  lessons: Lesson[];
  totalMinutes: number;
  done: number;
  nextLesson: Lesson | null;
  lastActivity: string | null;
  image: string | null;
};

const thumb = (l?: Lesson) => {
  const id = youtubeId(l?.video_url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
};

/** Carrega cursos publicados, aulas e o progresso de quem está vendo. */
export async function loadCourses(userId: string): Promise<CourseCard[]> {
  if (!hasSupabase) return demoCourses();
  const sb = await supabaseServer();
  const [{ data: courses }, { data: lessons }, { data: progress }] = await Promise.all([
    sb.from("courses").select("*").eq("published", true).order("position").order("created_at", { ascending: false }),
    sb.from("lessons").select("*").order("position"),
    sb.from("lesson_progress").select("lesson_id,completed,updated_at").eq("user_id", userId),
  ]);
  const prog = new Map((progress ?? []).map((p) => [p.lesson_id, p]));
  return ((courses ?? []) as Course[]).map((c) => {
    const ls = ((lessons ?? []) as Lesson[]).filter((l) => l.course_id === c.id);
    const done = ls.filter((l) => prog.get(l.id)?.completed).length;
    const last = ls
      .map((l) => prog.get(l.id)?.updated_at)
      .filter(Boolean)
      .sort()
      .pop() ?? null;
    return {
      ...c,
      lessons: ls,
      totalMinutes: ls.reduce((t, l) => t + (l.duration_minutes ?? 0), 0),
      done,
      nextLesson: ls.find((l) => !prog.get(l.id)?.completed) ?? ls[0] ?? null,
      lastActivity: last,
      image: c.cover_url ?? thumb(ls[0]),
    };
  });
}

export const lessonWord = (n: number) => (n === 1 ? "1 aula" : `${n} aulas`);

/* ---------- Demonstração (sem Supabase configurado) ---------- */
function demoCourses(): CourseCard[] {
  const mk = (
    id: string, title: string, subtitle: string, category: string, lessons: [string, number][],
    opts: { featured?: boolean; done?: number; video?: string; description?: string; cover?: string } = {},
  ): CourseCard => {
    const ls: Lesson[] = lessons.map(([t, m], i) => ({
      id: `${id}-${i + 1}`, course_id: id, title: t, description: null,
      video_url: opts.video ?? null, file_path: null, duration_minutes: m, position: i,
    }));
    const done = opts.done ?? 0;
    return {
      id, title, subtitle, description: opts.description ?? subtitle, cover_url: opts.cover ?? null, category, level: "Iniciante",
      featured: !!opts.featured, published: true, position: 0, created_at: "2026-11-01",
      lessons: ls, totalMinutes: ls.reduce((t, l) => t + (l.duration_minutes ?? 0), 0), done,
      nextLesson: ls[done] ?? ls[0], lastActivity: done ? "2026-11-25" : null, image: opts.cover ?? thumb(ls[0]),
    };
  };
  return [
    mk("entrevista", "Entrevista com J. Ricardo Temóteo", "Educação, tecnologia e longevidade", "Entrevistas",
      [["Entrevista completa", 0]], { featured: true, video: "https://youtu.be/Ox0Km9RrKto", cover: "/img/capa-entrevista.jpg",
        description: "Uma conversa sobre por que nunca é tarde para aprender e como nasceu a Comunidade Facilita 50+." }),
    mk("celular", "Primeiros passos no celular", "Ligar, configurar e deixar a letra maior", "Celular",
      [["Conhecendo o seu celular", 8], ["Aumentando a letra e o volume", 6], ["Fazendo e recebendo ligações", 7], ["Salvando contatos", 9]], { done: 2 }),
    mk("whatsapp", "WhatsApp sem medo", "Mensagens, áudios, fotos e chamadas de vídeo", "Celular",
      [["Enviando a primeira mensagem", 7], ["Gravando áudios", 5], ["Mandando fotos", 6], ["Chamada de vídeo com a família", 9]], { done: 1 }),
    mk("golpes", "Internet segura: como evitar golpes", "Reconheça mensagens falsas e proteja suas senhas", "Segurança",
      [["Os golpes mais comuns", 10], ["Senhas fortes", 8], ["Banco pelo celular com segurança", 12]]),
    mk("fotos", "Fotos e vídeos da família", "Tirar, guardar e compartilhar memórias", "Dia a dia",
      [["Tirando boas fotos", 6], ["Organizando a galeria", 7], ["Enviando para os netos", 5]]),
    mk("apps", "Aplicativos que facilitam a vida", "Transporte, saúde e compras pelo celular", "Dia a dia",
      [["Chamando um carro por aplicativo", 9], ["Marcando consultas", 8], ["Fazendo compras com segurança", 10]]),
  ];
}
