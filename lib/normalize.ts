// Heuristic normalization of the attached land.json into Parcel[]
// Tries multiple common key names; assumes area is in hectares unless a unit hints otherwise.

import type { Parcel } from "./types"

function toStringSafe(v: unknown): string | undefined {
  if (v == null) return undefined
  const s = String(v).trim()
  return s.length ? s : undefined
}

function toNumberSafe(v: unknown): number | undefined {
  if (v == null) return undefined
  const n = Number(String(v).replace(/,/g, ""))
  return Number.isFinite(n) ? n : undefined
}

function areaToHa(obj: Record<string, unknown>): number | undefined {
  // Try explicit hectare fields
  const haKeys = ["area_hectare", "areaHa", "hectare", "area_in_hectare", "area_ha"]
  for (const k of haKeys) {
    const n = toNumberSafe(obj[k])
    if (n != null) return n
  }
  // Generic area with unit hints
  const unit = toStringSafe(obj["area_unit"])?.toLowerCase()
  const area = toNumberSafe(obj["area"]) ?? toNumberSafe(obj["total_area"]) ?? toNumberSafe(obj["area_total"])
  if (area != null) {
    if (unit === "hectare" || unit === "ha") return area
    if (unit === "acre" || unit === "acres") return area * 0.40468564224
    if (unit === "bigha" || unit === "bighaa") {
      // UP bigha approx (varies by district). Commonly ~0.25 ha; this is a placeholder.
      return area * 0.25
    }
  }
  // If no unit, assume hectares
  return area ?? undefined
}

function ownerName(obj: Record<string, unknown>): string | undefined {
  const keys = ["owner", "owner_name", "farmer", "farmer_name", "name"]
  for (const k of keys) {
    const v = toStringSafe(obj[k])
    if (v) return v
  }
  // Sometimes owners embedded in remarks
  const remark = toStringSafe(obj["remarks"] || obj["note"])
  return remark
}

function pick(obj: Record<string, unknown>, names: string[]): string | undefined {
  for (const n of names) {
    const v = toStringSafe(obj[n])
    if (v) return v
  }
  return undefined
}

export function normalizeParcels(raw: unknown[]): Parcel[] {
  const rows = Array.isArray(raw) ? raw : []
  return rows
    .map((r, idx) => {
      const rec = (r || {}) as Record<string, unknown>
      const areaHa = areaToHa(rec)
      const owner = ownerName(rec) ?? "Unknown"
      const khata = pick(rec, ["khata", "khata_no", "khata_number"])
      const khasra = pick(rec, ["khasra", "khasra_no", "khasra_number", "gata", "plot_no"])
      const village = pick(rec, ["village", "gram", "gram_panchayat"])
      const tehsil = pick(rec, ["tehsil", "block", "taluka"])
      const district = pick(rec, ["district", "zila"])
      const state = pick(rec, ["state", "state_name"])
      if (areaHa == null || !Number.isFinite(areaHa)) return null
      const id =
        toStringSafe(rec["id"]) ||
        [owner, khata, khasra, village, tehsil, district].filter(Boolean).join("|") ||
        `row-${idx}`
      return {
        id,
        owner,
        khata,
        khasra,
        village,
        tehsil,
        district,
        state,
        areaHa,
        raw: rec,
      } as Parcel
    })
    .filter(Boolean) as Parcel[]
}
