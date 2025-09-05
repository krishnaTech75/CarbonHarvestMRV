"use client"

import { useMemo, useState } from "react"
import type { Parcel, OwnerAggregate } from "@/lib/types"
import { aggregateByOwner, round4 } from "@/lib/aggregate"
import { SearchFilter, type Filters } from "@/components/search-filter"
import { OwnerTable } from "@/components/owner-table"
import { ParcelTable } from "@/components/parcel-table"
import { CarbonCalculator } from "@/components/carbon-calculator"
import { DownloadCSV } from "@/components/download-csv"

function filterParcels(parcels: Parcel[], filters: Filters): Parcel[] {
  const q = (filters.q || "").trim()
  if (!q) return parcels
  const needle = q.toLowerCase()
  return parcels.filter((p) => {
    return (
      p.name.toLowerCase().includes(needle) ||
      p.khata_number.toLowerCase().includes(needle) ||
      p.khasra_no.toLowerCase().includes(needle) ||
      p.unique_code.toLowerCase().includes(needle)
    )
  })
}

export default function ClientDashboard({
  parcels,
  ownersInitial,
}: {
  parcels: Parcel[]
  ownersInitial: OwnerAggregate[]
}) {
  const [filters, setFilters] = useState<Filters>({ q: "" })
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null)

  const filteredParcels = useMemo(() => filterParcels(parcels, filters), [parcels, filters])
  const owners = useMemo(() => {
    if (!filters.q) return ownersInitial
    return aggregateByOwner(filteredParcels)
  }, [ownersInitial, filters.q, filteredParcels])

  const selectedParcels = useMemo(
    () => (selectedOwner ? filteredParcels.filter((p) => p.name === selectedOwner) : filteredParcels),
    [filteredParcels, selectedOwner],
  )

  const ownerCSV = owners.map((o) => ({
    owner: o.owner,
    total_area_ha: round4(o.totalAreaHa),
    plots: o.plots,
    khatas: o.khatas,
  }))

  const parcelsCSV = selectedParcels.map((p) => ({
    owner: p.name,
    khata_number: p.khata_number,
    khasra_no: p.khasra_no,
    unique_code: p.unique_code,
    area_ha: round4(p.area),
    timestamp: p.timestamp ?? "",
  }))

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <SearchFilter onChange={setFilters} />
        <div className="flex items-center gap-2">
          <DownloadCSV filename="owners.csv" rows={ownerCSV} />
          <DownloadCSV filename="parcels.csv" rows={parcelsCSV} />
        </div>
      </div>

      <div className="grid gap-6">
        <OwnerTable owners={owners} parcels={filteredParcels} onSelectOwner={setSelectedOwner} />

        {selectedOwner && (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Parcels for: {selectedOwner}</h2>
            <button
              className="rounded-md border px-3 py-2 text-sm"
              onClick={() => setSelectedOwner(null)}
              aria-label="Clear owner selection"
            >
              Clear selection
            </button>
          </div>
        )}

        <ParcelTable
          parcels={selectedParcels}
          title={selectedOwner ? `Parcels (${selectedOwner})` : "Parcels (current filter)"}
        />

        <CarbonCalculator parcels={selectedParcels} />
      </div>
    </section>
  )
}
