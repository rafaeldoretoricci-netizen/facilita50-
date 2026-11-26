import { NextResponse, type NextRequest } from "next/server";
import { hasSupabase } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  if (hasSupabase) await (await supabaseServer()).auth.signOut();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
