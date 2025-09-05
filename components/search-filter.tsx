"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export type Filters = {
  q: string
}

type Props = {
  className?: string
  onChange: (filters: Filters) => void
}

export function SearchFilter({ className, onChange }: Props) {
  const [q, setQ] = useState("")

  // Debounce to reduce re-renders
  useEffect(() => {
    const id = setTimeout(() => onChange({ q }), 200)
    return () => clearTimeout(id)
  }, [q, onChange])

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by owner, khata, khasra, unique code"
        className="w-full md:w-96 rounded-md border bg-background px-3 py-2 text-sm outline-none"
        aria-label="Search"
      />
      <button
        type="button"
        className="rounded-md border px-3 py-2 text-sm"
        onClick={() => setQ("")}
        aria-label="Clear search"
      >
        Clear
      </button>
    </div>
  )
}
