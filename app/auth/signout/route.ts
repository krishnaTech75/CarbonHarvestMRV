import { getServerSupabase } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await getServerSupabase()
  await supabase.auth.signOut()
  return NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "http://localhost:3000"),
  )
}
