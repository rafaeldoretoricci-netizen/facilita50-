import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** Conclui a entrada pelo link enviado por e-mail. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const voltar = url.searchParams.get("voltar") ?? "/membros";
  const dest = voltar.startsWith("/") && !voltar.startsWith("//") ? voltar : "/membros";
  if (code) {
    const sb = await supabaseServer();
    await sb.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(dest, url.origin));
}
