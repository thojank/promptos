import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(`${req.nextUrl.origin}/login`);

  const supabase = createSupabaseServerClient();
  await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(`${req.nextUrl.origin}/library`);
}
