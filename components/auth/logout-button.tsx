"use client"

import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
      aria-label="Log out"
    >
      Log out
    </button>
  )
}
