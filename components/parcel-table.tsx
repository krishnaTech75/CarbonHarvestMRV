"use client"

import type { Parcel } from "@/lib/types"

type Props = {
  parcels: Parcel[]
  title?: string
}

export function ParcelTable({ parcels, title }: Props) {
  return (
    <section className="rounded-lg border overflow-auto">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
        <h3 className="text-sm font-medium text-pretty">{title || "Parcels"}</h3>
        <div className="text-xs text-muted-foreground">Rows: {parcels.length.toLocaleString()}</div>
      </div>
      <table className="min-w-[880px] w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-3 py-2">Owner</th>
            <th className="text-left px-3 py-2">Khata</th>
            <th className="text-left px-3 py-2">Khasra</th>
            <th className="text-left px-3 py-2">Unique Code</th>
            <th className="text-right px-3 py-2">Area (ha)</th>
            <th className="text-left px-3 py-2">Updated</th>
          </tr>
        </thead>
        <tbody>
          {parcels.map((p) => (
            <tr key={p.unique_code} className="border-t">
              <td className="px-3 py-2">{p.name}</td>
              <td className="px-3 py-2">{p.khata_number}</td>
              <td className="px-3 py-2">{p.khasra_no}</td>
              <td className="px-3 py-2">{p.unique_code}</td>
              <td className="px-3 py-2 text-right">{p.area.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
              <td className="px-3 py-2">{formatTime(p.timestamp)}</td>
            </tr>
          ))}
          {parcels.length === 0 && (
            <tr>
              <td className="px-3 py-6 text-center text-muted-foreground" colSpan={6}>
                No parcels to display.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  )
}

function formatTime(ts?: string) {
  if (!ts) return "—"
  try {
    const d = new Date(ts)
    if (isNaN(d.getTime())) return ts
    return d.toLocaleString()
  } catch {
    return ts
  }
}
