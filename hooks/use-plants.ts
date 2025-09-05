"use client"

import useSWR from "swr"

export type Plant = {
  commonName: string
  scientificName: string
  estimatedDailyCarbonAbsorptionKg: number
}

export function usePlants() {
  const { data, error, isLoading } = useSWR("/data/plants.txt", (u) => fetch(u).then((r) => r.text()))
  let plants: Plant[] = []
  if (data) {
    try {
      const start = data.indexOf('"plants"')
      if (start >= 0) {
        const l = data.indexOf("[", start)
        let depth = 0
        let r = -1
        for (let i = l; i < data.length; i++) {
          const ch = data[i]
          if (ch === "[") depth++
          else if (ch === "]") {
            depth--
            if (depth === 0) {
              r = i
              break
            }
          }
        }
        if (l !== -1 && r !== -1) {
          plants = JSON.parse(data.slice(l, r + 1))
        }
      }
    } catch {
      plants = []
    }
  }
  return { plants, isLoading, error }
}
