"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasSupabase } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";

/** Marca (ou desmarca) uma aula como concluída e, se pedido, segue para a próxima. */
export async function setLessonDone(form: FormData) {
  if (!hasSupabase) redirect(String(form.get("next") || "/membros"));
  const { user } = await getSession();
  if (!user) redirect("/entrar");
  const lessonId = String(form.get("lesson_id"));
  const courseId = String(form.get("course_id"));
  const done = form.get("done") === "1";
  const next = String(form.get("next") ?? "");
  const sb = await supabaseServer();
  await sb.from("lesson_progress").upsert(
    { user_id: user.id, lesson_id: lessonId, course_id: courseId, completed: done, updated_at: new Date().toISOString() },
    { onConflict: "user_id,lesson_id" },
  );
  revalidatePath("/membros", "layout");
  if (next) redirect(next);
}
