import { getServerSupabase } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import raw from "@/data/bhulekh.json"
import { parseParcels, aggregateByOwner, summarize } from "@/lib/aggregate"
import type { ParcelRaw } from "@/lib/types"
import { SummaryCards } from "@/components/summary-cards"
import ClientDashboard from "@/components/client-dashboard"

export default async function DashboardPage() {
  const supabase = await getServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    redirect("/login")
  }

  const parcelsAll = parseParcels(raw as ParcelRaw[])
  const statsAll = summarize(parcelsAll)
  const ownersAll = aggregateByOwner(parcelsAll)

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold text-balance">MRV Dashboard</h1>
        <p className="text-sm text-muted-foreground">Signed in as {data.user.email}</p>
      </header>

      <SummaryCards
        totalAreaHa={statsAll.totalAreaHa}
        plots={statsAll.plots}
        uniqueOwners={statsAll.uniqueOwners}
        uniqueKhatas={statsAll.uniqueKhatas}
      />

      {/* Client-side filters, tables, and calculator */}
      <ClientDashboard parcels={parcelsAll} ownersInitial={ownersAll} />
    </main>
  )
}
