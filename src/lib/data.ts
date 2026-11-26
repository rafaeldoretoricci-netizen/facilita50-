import "server-only";
import { hasSupabase } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";
import type { Book, Settings } from "@/lib/types";

/** Dados de demonstração, usados enquanto o Supabase não está configurado. */
const DEMO_BOOKS: Book[] = [
  ["o-amor-e-o-caminho", "O Amor é o Caminho", "Lançamento 2026", 59.9, 29.9, "/img/o-amor-e-o-caminho.jpg"],
  ["informatica-para-a-vida-1", "Informática para a Vida", "Volume 1", 49.9, 24.9, null],
  ["informatica-para-a-vida-2", "Informática para a Vida", "Volume 2", 49.9, 24.9, null],
  ["smartphone-celular-inteligente-1", "Smartphone (Celular Inteligente)", "Volume 1", 44.9, 22.9, null],
  ["celular-na-pratica-1", "Celular na Prática", "Volume 1", 39.9, 19.9, null],
  ["celular-na-pratica-2", "Celular na Prática", "Volume 2", 39.9, 19.9, null],
].map(([slug, title, subtitle, pf, pd, cover], i) => ({
  id: String(slug),
  slug: String(slug),
  title: String(title),
  subtitle: subtitle as string,
  author: "J. Ricardo Temóteo",
  synopsis:
    i === 0
      ? "Reflexões sobre a existência, as relações humanas e a espiritualidade, escritas com a sensibilidade de um poeta e a sinceridade de um aprendiz. Entre pedras e estrelas, J. Ricardo Temóteo convida você a olhar para a própria caminhada com mais calma e a descobrir, página a página, que o amor é o caminho."
      : null,
  cover_url: cover as string | null,
  has_physical: true,
  has_digital: true,
  price_physical: pf as number,
  price_digital: pd as number,
  ebook_path: null,
  show_in_showcase: true,
  position: i,
}));

const DEMO_SETTINGS: Settings = {
  launch_book_id: "o-amor-e-o-caminho",
  only_launch: false,
  community_price: 39.9,
  shipping_flat: 18.5,
};

export async function getSettings(): Promise<Settings> {
  if (!hasSupabase) return DEMO_SETTINGS;
  const sb = await supabaseServer();
  const { data } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (data as Settings) ?? DEMO_SETTINGS;
}

export async function getBooks(): Promise<Book[]> {
  if (!hasSupabase) return DEMO_BOOKS;
  const sb = await supabaseServer();
  const { data } = await sb.from("books").select("*").order("position");
  return (data as Book[]) ?? [];
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const books = await getBooks();
  return books.find((b) => b.slug === slug) ?? null;
}
