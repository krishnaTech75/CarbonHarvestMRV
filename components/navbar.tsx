"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseBrowser()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setEmail(data.user?.email ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return
      setEmail(session?.user?.email ?? null)
    })
    return () => {
      mounted = false
      sub?.subscription.unsubscribe()
    }
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
  }

  const nav = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/chat", label: "Chat" },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-emerald-700">
          Agroforestry MRV
        </Link>
        <ul className="flex items-center gap-4">
          {nav.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                className={cn(
                  "text-sm font-medium hover:text-emerald-700",
                  pathname === n.href ? "text-emerald-700" : "text-slate-600",
                )}
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          {email ? (
            <>
              <span className="hidden sm:inline text-sm text-slate-600">{email}</span>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-emerald-600 text-emerald-700 bg-transparent"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/signup">
                <Button variant="ghost">Sign up</Button>
              </Link>
              <Link href="/login">
                <Button className="bg-emerald-600 text-white hover:bg-emerald-700">Log in</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
