import useSWR from "swr"

export type Parcel = {
  // adapt to your JSON fields; we map a few common keys safely
  owner?: string
  village?: string
  district?: string
  khataNo?: string
  khasraNo?: string
  areaHectare?: number
  [k: string]: any
}

export function useBhulekh() {
  const fetcher = (url: string) => fetch(url).then((r) => r.json())
  const { data, error, isLoading } = useSWR<Parcel[]>("/data/bhulekh.json", fetcher)

  const totalAreaHa = data?.reduce((sum, p) => sum + (Number(p.areaHectare) || 0), 0) ?? 0
  const uniqueOwners = new Set((data ?? []).map((p) => (p.owner || "").trim()).filter(Boolean))
  const ownerCount = uniqueOwners.size

  return { parcels: data ?? [], totalAreaHa, ownerCount, isLoading, error }
}
