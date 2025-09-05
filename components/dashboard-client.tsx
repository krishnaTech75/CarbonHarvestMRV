"use client"

import { useLand } from "@/hooks/use-land"
import SummaryCards from "@/components/summary-cards"
import CarbonCalculator from "@/components/carbon-calculator"

export default function DashboardClient() {
  const { parcels, owners, totals, isLoading, error } = useLand()

  if (isLoading) return <p>Loading data...</p>
  if (error) return <p className="text-red-600">Failed to load land data.</p>

  return (
    <div className="space-y-6">
      <SummaryCards totalAreaHa={totals.areaHa} totalParcels={totals.parcels} totalOwners={owners.length} />
      <CarbonCalculator areaHa={totals.areaHa || 0} />

      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-3 text-lg font-semibold text-emerald-700">Top Owners by Area</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Owner</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Parcels</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Area (ha)</th>
              </tr>
            </thead>
            <tbody>
              {owners.slice(0, 20).map((o) => (
                <tr key={o.owner} className="border-t">
                  <td className="px-3 py-2">{o.owner}</td>
                  <td className="px-3 py-2">{o.parcels}</td>
                  <td className="px-3 py-2">{o.areaHa.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
