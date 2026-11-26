import "server-only";
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

