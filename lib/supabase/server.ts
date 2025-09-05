"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

let serverClient: ReturnType<typeof createServerClient> | null = null

export async function getServerSupabase() {
  if (serverClient) return serverClient
  const cookieStore = cookies()
  serverClient = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set() {
        // Next.js manages cookies automatically
      },
      remove() {
        // Next.js manages cookies automatically
      },
    },
  })
  return serverClient
}
