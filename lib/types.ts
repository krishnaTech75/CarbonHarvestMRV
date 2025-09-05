export type Parcel = {
  name: string
  khata_number: string
  khasra_no: string
  status?: string | null
  unique_code: string
  area: number // hectares
  land_type?: string | null
  lt?: string | null
  search_char?: string | null
  timestamp?: string
}

export type ParcelRaw = {
  name: string
  khata_number: string
  khasra_no: string
  status?: string | null
  unique_code: string
  area: string // in source JSON as string
  land_type?: string | null
  lt?: string | null
  search_char?: string | null
  timestamp?: string
}

export type OwnerAggregate = {
  owner: string
  totalAreaHa: number
  plots: number
  khatas: number
}
