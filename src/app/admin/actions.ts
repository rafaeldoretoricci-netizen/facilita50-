"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

const num = (v: FormDataEntryValue | null) => {
  const raw = String(v ?? "").trim();
  const n = parseFloat(raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw);
  return Number.isFinite(n) ? n : null;
};
const str = (v: FormDataEntryValue | null) => String(v ?? "").trim() || null;
const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function db() {
  await requireAdmin();
  return supabaseServer();
}
const refresh = () => {
  revalidatePath("/", "layout");
};

/* ---------- Vitrine ---------- */
export async function setLaunch(form: FormData) {
  const sb = await db();
  const id = String(form.get("id"));
  await sb.from("site_settings").update({ launch_book_id: id, updated_at: new Date().toISOString() }).eq("id", 1);
  await sb.from("books").update({ show_in_showcase: true }).eq("id", id);
  refresh();
}

export async function toggleShowcase(form: FormData) {
  const sb = await db();
  await sb.from("books").update({ show_in_showcase: form.get("show") === "1" }).eq("id", String(form.get("id")));
  refresh();
}

export async function saveSettings(form: FormData) {
  const sb = await db();
  await sb
    .from("site_settings")
    .update({
      only_launch: form.get("only_launch") === "on",
      community_price: num(form.get("community_price")) ?? 39.9,
      shipping_flat: num(form.get("shipping_flat")) ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  refresh();
}

export async function saveBook(form: FormData) {
  const sb = await db();
  const id = str(form.get("id"));
  const title = String(form.get("title") ?? "").trim();
  if (!title) return;
  const subtitle = str(form.get("subtitle"));
  const row: Record<string, unknown> = {
    title,
    subtitle,
    synopsis: str(form.get("synopsis")),
    price_physical: num(form.get("price_physical")),
    price_digital: num(form.get("price_digital")),
    has_physical: form.get("has_physical") === "on",
    has_digital: form.get("has_digital") === "on",
  };
  const cover = str(form.get("cover_url"));
  const ebook = str(form.get("ebook_path"));
  if (cover) row.cover_url = cover;
  if (ebook) row.ebook_path = ebook;

  if (id) {
    await sb.from("books").update(row).eq("id", id);
  } else {
    const { count } = await sb.from("books").select("id", { count: "exact", head: true });
    row.slug = `${slugify(title)}${subtitle ? "-" + slugify(subtitle) : ""}-${Date.now().toString(36).slice(-4)}`;
    row.position = count ?? 0;
    await sb.from("books").insert(row);
  }
  refresh();
}

export async function deleteBook(form: FormData) {
  const sb = await db();
  await sb.from("books").delete().eq("id", String(form.get("id")));
  refresh();
}

export async function moveBook(form: FormData) {
  const sb = await db();
  const id = String(form.get("id"));
  const dir = form.get("dir") === "up" ? -1 : 1;
  const { data: books } = await sb.from("books").select("id,position").order("position");
  if (!books) return;
  const i = books.findIndex((b) => b.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= books.length) return;
  [books[i], books[j]] = [books[j], books[i]];
  await Promise.all(books.map((b, k) => sb.from("books").update({ position: k }).eq("id", b.id)));
  refresh();
}

/* ---------- Pedidos ---------- */
export async function markShipped(form: FormData) {
  const sb = await db();
  await sb.from("orders").update({ shipped_at: new Date().toISOString() }).eq("id", String(form.get("id")));
  revalidatePath("/admin/pedidos");
}

/* ---------- Conteúdos ---------- */
export async function saveContent(form: FormData) {
  const sb = await db();
  const title = String(form.get("title") ?? "").trim();
  if (!title) return;
  const kind = String(form.get("kind"));
  const defaultRail = { video: "Cursos em vídeo", entrevista: "Entrevistas", livro: "Livros digitais", artigo: "Artigos" }[kind] ?? "Conteúdos";
  const row: Record<string, unknown> = {
    kind,
    title,
    rail: str(form.get("rail")) ?? defaultRail,
    description: str(form.get("description")),
    video_url: str(form.get("video_url")),
    body: str(form.get("body")),
    duration_minutes: num(form.get("duration_minutes")),
    featured: form.get("featured") === "on",
  };
  const file = str(form.get("file_path"));
  const thumb = str(form.get("thumbnail_url"));
  if (file) row.file_path = file;
  if (thumb) row.thumbnail_url = thumb;
  if (row.featured) await sb.from("contents").update({ featured: false }).eq("featured", true);
  await sb.from("contents").insert(row);
  revalidatePath("/membros");
  revalidatePath("/admin/conteudos");
}

export async function toggleContent(form: FormData) {
  const sb = await db();
  const id = String(form.get("id"));
  const field = form.get("field") === "featured" ? "featured" : "published";
  const value = form.get("value") === "1";
  if (field === "featured" && value) await sb.from("contents").update({ featured: false }).eq("featured", true);
  await sb.from("contents").update({ [field]: value }).eq("id", id);
  revalidatePath("/membros");
  revalidatePath("/admin/conteudos");
}

export async function deleteContent(form: FormData) {
  const sb = await db();
  await sb.from("contents").delete().eq("id", String(form.get("id")));
  revalidatePath("/membros");
  revalidatePath("/admin/conteudos");
}

/* ---------- Cursos e aulas ---------- */
const refreshCourses = () => {
  revalidatePath("/membros", "layout");
  revalidatePath("/admin/cursos");
};

export async function saveCourse(form: FormData) {
  const sb = await db();
  const id = str(form.get("id"));
  const title = String(form.get("title") ?? "").trim();
  if (!title) return;
  const row: Record<string, unknown> = {
    title,
    subtitle: str(form.get("subtitle")),
    description: str(form.get("description")),
    category: str(form.get("category")) ?? "Cursos",
    level: str(form.get("level")),
    featured: form.get("featured") === "on",
  };
  const cover = str(form.get("cover_url"));
  if (cover) row.cover_url = cover;
  if (row.featured) await sb.from("courses").update({ featured: false }).eq("featured", true);
  if (id) await sb.from("courses").update(row).eq("id", id);
  else await sb.from("courses").insert(row);
  refreshCourses();
}

export async function toggleCourse(form: FormData) {
  const sb = await db();
  const id = String(form.get("id"));
  const field = form.get("field") === "featured" ? "featured" : "published";
  const value = form.get("value") === "1";
  if (field === "featured" && value) await sb.from("courses").update({ featured: false }).eq("featured", true);
  await sb.from("courses").update({ [field]: value }).eq("id", id);
  refreshCourses();
}

export async function deleteCourse(form: FormData) {
  const sb = await db();
  await sb.from("courses").delete().eq("id", String(form.get("id")));
  refreshCourses();
}

export async function addLesson(form: FormData) {
  const sb = await db();
  const courseId = String(form.get("course_id"));
  const title = String(form.get("title") ?? "").trim();
  if (!title) return;
  const { count } = await sb.from("lessons").select("id", { count: "exact", head: true }).eq("course_id", courseId);
  await sb.from("lessons").insert({
    course_id: courseId,
    title,
    description: str(form.get("description")),
    video_url: str(form.get("video_url")),
    file_path: str(form.get("file_path")),
    duration_minutes: num(form.get("duration_minutes")),
    position: count ?? 0,
  });
  refreshCourses();
}

export async function deleteLesson(form: FormData) {
  const sb = await db();
  await sb.from("lessons").delete().eq("id", String(form.get("id")));
  refreshCourses();
}

export async function moveLesson(form: FormData) {
  const sb = await db();
  const id = String(form.get("id"));
  const courseId = String(form.get("course_id"));
  const dir = form.get("dir") === "up" ? -1 : 1;
  const { data: ls } = await sb.from("lessons").select("id,position").eq("course_id", courseId).order("position");
  if (!ls) return;
  const i = ls.findIndex((l) => l.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ls.length) return;
  [ls[i], ls[j]] = [ls[j], ls[i]];
  await Promise.all(ls.map((l, k) => sb.from("lessons").update({ position: k }).eq("id", l.id)));
  refreshCourses();
}
