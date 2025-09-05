"use client"

import type React from "react"

import { useMemo, useState } from "react"
import type { OwnerAggregate, Parcel } from "@/lib/types"
import { round4 } from "@/lib/aggregate"

type Props = {
  owners: OwnerAggregate[]
  parcels: Parcel[]
  onSelectOwner: (owner: string | null) => void
}

type SortKey = "owner" | "totalAreaHa" | "plots" | "khatas"

export function OwnerTable({ owners, parcels, onSelectOwner }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("totalAreaHa")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const sorted = useMemo(() => {
    const copy = [...owners]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av === bv) return 0
      const res = av < bv ? -1 : 1
      return sortDir === "asc" ? res : -res
    })
    return copy
  }, [owners, sortKey, sortDir])

  function toggleSort(k: SortKey) {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(k)
      setSortDir("desc")
    }
  }

  return (
    <div className="rounded-lg border overflow-auto">
      <table className="min-w-[720px] w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <Th onClick={() => toggleSort("owner")}>Owner</Th>
            <Th onClick={() => toggleSort("totalAreaHa")}>Area (ha)</Th>
            <Th onClick={() => toggleSort("plots")}>Plots</Th>
            <Th onClick={() => toggleSort("khatas")}>Khatas</Th>
            <th className="text-right px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((o) => (
            <tr key={o.owner} className="border-t">
              <td className="px-3 py-2">{o.owner}</td>
              <td className="px-3 py-2">{o.totalAreaHa.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
              <td className="px-3 py-2">{o.plots.toLocaleString()}</td>
              <td className="px-3 py-2">{o.khatas.toLocaleString()}</td>
              <td className="px-3 py-2 text-right">
                <button
                  className="rounded-md border px-2 py-1 text-xs"
                  onClick={() => onSelectOwner(o.owner)}
                  aria-label={`View parcels for ${o.owner}`}
                >
                  View parcels
                </button>
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td className="px-3 py-6 text-center text-muted-foreground" colSpan={5}>
                No owners match your filters.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot className="bg-muted/40">
          <tr>
            <td className="px-3 py-2 font-medium">Total</td>
            <td className="px-3 py-2 font-medium">
              {round4(owners.reduce((s, o) => s + o.totalAreaHa, 0)).toLocaleString(undefined, {
                maximumFractionDigits: 4,
              })}
            </td>
            <td className="px-3 py-2 font-medium">{owners.reduce((s, o) => s + o.plots, 0).toLocaleString()}</td>
            <td className="px-3 py-2 font-medium">—</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function Th({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <th className="text-left px-3 py-2">
      <button className="inline-flex items-center gap-1 hover:underline" onClick={onClick}>
        {children}
        <span className="text-xs text-muted-foreground">(sort)</span>
      </button>
    </th>
  )
}
