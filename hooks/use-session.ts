"use client"

import { useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { getSupabaseBrowser } from "@/lib/supabase/client"

type UseSessionResult = {
  session: Session | null
  user: User | null
  loading: boolean
}

export function useSession(): UseSessionResult {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!active) return
        setSession(data.session ?? null)
        setUser(data.session?.user ?? null)
      } finally {
        if (active) setLoading(false)
      }
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession ?? null)
      setUser(nextSession?.user ?? null)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  return { session, user, loading }
}
