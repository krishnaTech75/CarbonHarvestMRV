import raw from "@/data/bhulekh.json"
import { parseParcels, aggregateByOwner, summarize } from "@/lib/aggregate"
import type { ParcelRaw } from "@/lib/types"
import { SummaryCards } from "@/components/summary-cards"
import ClientDashboard from "@/components/client-dashboard"

export default function Page() {
  // Parse data on the server
  const parcelsAll = parseParcels(raw as ParcelRaw[])
  const statsAll = summarize(parcelsAll)
  const ownersAll = aggregateByOwner(parcelsAll)

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold text-balance">Land MRV Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Explore parcels, aggregate by owner, and estimate carbon potential from agroforestry and rice practices.
        </p>
      </header>

      <SummaryCards
        totalAreaHa={statsAll.totalAreaHa}
        plots={statsAll.plots}
        uniqueOwners={statsAll.uniqueOwners}
        uniqueKhatas={statsAll.uniqueKhatas}
      />

      <ClientDashboard parcels={parcelsAll} ownersInitial={ownersAll} />
    </main>
  )
}
