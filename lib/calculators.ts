import type { AgroforestryParams, RiceParams } from "./types"

export function agroforestryTco2e(areaHa: number, p: AgroforestryParams) {
  const base = areaHa * p.sequestrationRatePerHaYr * p.years
  const u = Math.max(0, Math.min(100, p.uncertaintyPct ?? 0)) / 100
  return {
    central: base,
    low: base * (1 - u),
    high: base * (1 + u),
    revenue:
      p.pricePerTco2e != null
        ? {
            central: base * p.pricePerTco2e,
            low: base * (1 - u) * p.pricePerTco2e,
            high: base * (1 + u) * p.pricePerTco2e,
          }
        : undefined,
  }
}

export function riceMethaneTco2e(areaHa: number, p: RiceParams) {
  const riceHa = areaHa * p.riceAreaShare
  const base = riceHa * p.seasonsPerYear * p.baselineEFPerHaSeason * p.reductionFactor
  const u = Math.max(0, Math.min(100, p.uncertaintyPct ?? 0)) / 100
  return {
    central: base,
    low: base * (1 - u),
    high: base * (1 + u),
    revenue:
      p.pricePerTco2e != null
        ? {
            central: base * p.pricePerTco2e,
            low: base * (1 - u) * p.pricePerTco2e,
            high: base * (1 + u) * p.pricePerTco2e,
          }
        : undefined,
  }
}
