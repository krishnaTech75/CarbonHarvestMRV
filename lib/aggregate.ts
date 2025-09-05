import type { Parcel, ParcelRaw, OwnerAggregate } from "./types"

export function parseParcels(raw: ParcelRaw[]): Parcel[] {
  return raw
    .map((r) => {
      const area = safeNumber(r.area)
      return {
        name: r.name?.trim() || "—",
        khata_number: r.khata_number?.trim() || "—",
        khasra_no: r.khasra_no?.trim() || "—",
        status: r.status ?? null,
        unique_code: r.unique_code,
        area,
        land_type: r.land_type ?? null,
        lt: r.lt ?? null,
        search_char: r.search_char ?? null,
        timestamp: r.timestamp,
      }
    })
    .filter((p) => Number.isFinite(p.area) && p.area > 0)
}

function safeNumber(v: unknown): number {
  if (typeof v === "number") return v
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.-]/g, ""))
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

export function aggregateByOwner(parcels: Parcel[]): OwnerAggregate[] {
  const map = new Map<string, { area: number; plots: number; khatas: Set<string> }>()
  for (const p of parcels) {
    const key = p.name || "—"
    if (!map.has(key)) map.set(key, { area: 0, plots: 0, khatas: new Set<string>() })
    const entry = map.get(key)!
    entry.area += p.area
    entry.plots += 1
    if (p.khata_number) entry.khatas.add(p.khata_number)
  }
  return Array.from(map.entries())
    .map(([owner, v]) => ({
      owner,
      totalAreaHa: round4(v.area),
      plots: v.plots,
      khatas: v.khatas.size,
    }))
    .sort((a, b) => b.totalAreaHa - a.totalAreaHa)
}

export function summarize(parcels: Parcel[]) {
  const totalAreaHa = round4(parcels.reduce((s, p) => s + p.area, 0))
  const plots = parcels.length
  const uniqueOwners = new Set(parcels.map((p) => p.name)).size
  const uniqueKhatas = new Set(parcels.map((p) => p.khata_number)).size
  return { totalAreaHa, plots, uniqueOwners, uniqueKhatas }
}

export function round4(n: number) {
  return Math.round(n * 10000) / 10000
}
