"use client"

import useSWR from "swr"
import type { LandParcel, OwnerAggregate } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function toHectares(area: any, unit?: string) {
  // best-effort normalization; adjust if your schema uses different fields
  const a = Number(area) || 0
  if (!unit) return a // assume already hectares when unit unknown
  const u = String(unit).toLowerCase()
  if (u.includes("hectare") || u === "ha") return a
  if (u.includes("acre") || u === "ac") return a * 0.4046856422
  if (u.includes("sqm") || u.includes("m2")) return a / 10000
  if (u.includes("bigha")) return a * 0.25084 // rough N India bigha→ha; verify regionally
  return a
}

export function useLand() {
  const { data, error, isLoading } = useSWR<any>("/data/bhulekh.json", fetcher)

  const parcels: LandParcel[] = Array.isArray(data)
    ? data.map((row: any) => ({
        owner: row.owner || row.Owner || row.name || row.khewatName || "",
        khata: row.khata || row.khewat || row.khewatNo || row.khatauni || "",
        khasra: row.khasra || row.khasraNo || row.plotNo || "",
        village: row.village || row.villageName || "",
        district: row.district || row.districtName || "",
        areaHa: toHectares(row.areaHa ?? row.area ?? row.Area, row.unit ?? row.Unit),
        raw: row,
      }))
    : []

  const ownersMap = new Map<string, OwnerAggregate>()
  for (const p of parcels) {
    const key = p.owner || "Unknown"
    const prev = ownersMap.get(key) || { owner: key, parcels: 0, areaHa: 0 }
    prev.parcels += 1
    prev.areaHa += p.areaHa || 0
    ownersMap.set(key, prev)
  }
  const owners = Array.from(ownersMap.values()).sort((a, b) => b.areaHa - a.areaHa)

  const totals = parcels.reduce(
    (acc, p) => {
      acc.areaHa += p.areaHa || 0
      acc.parcels += 1
      return acc
    },
    { areaHa: 0, parcels: 0 },
  )

  return { parcels, owners, totals, error, isLoading }
}
