"use client"

import type React from "react"

import { useState } from "react"
import { getBrowserSupabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = getBrowserSupabase()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-sm space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <h1 className="text-balance text-center text-2xl font-semibold text-slate-900">Sign in</h1>
      <label className="block text-sm">
        Email
        <input
          className="mt-1 w-full rounded-md border px-3 py-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm">
        Password
        <input
          className="mt-1 w-full rounded-md border px-3 py-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error && <p className="text-sm text-amber-600">{error}</p>}
      <button
        disabled={loading}
        className="w-full rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-sm text-slate-600">
        No account?{" "}
        <a className="text-emerald-700 underline" href="/signup">
          Sign up
        </a>
      </p>
    </form>
  )
}
