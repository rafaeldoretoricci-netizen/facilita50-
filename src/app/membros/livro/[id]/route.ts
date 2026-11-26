import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** Livro digital incluído na assinatura: link temporário para membros ativos. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data: member } = await sb.rpc("is_member");
  if (!member) return NextResponse.redirect(new URL("/minha-conta", req.url));
  const { data: book } = await sb.from("books").select("ebook_path").eq("id", id).maybeSingle();
  if (!book?.ebook_path) return new NextResponse("Arquivo indisponível", { status: 404 });
  const { data } = await sb.storage.from("ebooks").createSignedUrl(book.ebook_path, 3600);
  if (!data?.signedUrl) return new NextResponse("Não foi possível abrir agora", { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
