import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Gera um link temporário (1 hora) para baixar o livro digital de um pedido pago. */
export async function GET(_: Request, { params }: { params: Promise<{ pedido: string }> }) {
  const { pedido } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(pedido)) return new NextResponse("Pedido inválido", { status: 404 });
  const db = supabaseAdmin();
  const { data: order } = await db.from("orders").select("status,format,book_id").eq("id", pedido).maybeSingle();
  if (!order || order.status !== "paid" || order.format !== "digital") {
    return new NextResponse("Este pedido ainda não está liberado para download.", { status: 403 });
  }
  const { data: book } = await db.from("books").select("ebook_path").eq("id", order.book_id).maybeSingle();
  if (!book?.ebook_path) return new NextResponse("O arquivo deste livro ainda não foi enviado. Fale com a gente pelo WhatsApp.", { status: 404 });
  const { data } = await db.storage.from("ebooks").createSignedUrl(book.ebook_path, 3600, { download: true });
  if (!data?.signedUrl) return new NextResponse("Não foi possível gerar o link agora.", { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
