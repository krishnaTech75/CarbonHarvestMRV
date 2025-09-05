"use client"

import type { Role } from "@/lib/types"

export function RoleBadge({ role }: { role?: Role }) {
  if (!role) return null
  const color =
    role === "admin"
      ? "bg-amber-500"
      : role === "developer"
        ? "bg-emerald-600"
        : role === "verifier"
          ? "bg-sky-600"
          : "bg-slate-600"
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${color}`}>
      {role.toUpperCase()}
    </span>
  )
}
