"use client"

import jsPDF from "jspdf"
import "jspdf-autotable"
import type { OwnerAggregate } from "@/lib/types"

export function DownloadReport({ owners }: { owners: OwnerAggregate[] }) {
  const download = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Agroforestry & Rice MRV - Summary Report", 14, 16)
    doc.setFontSize(11)
    const totalArea = owners.reduce((s, o) => s + o.totalAreaHa, 0).toFixed(2)
    const totalParcels = owners.reduce((s, o) => s + o.parcelCount, 0)
    const totalOwners = owners.length
    doc.text(`Total Area: ${totalArea} ha | Parcels: ${totalParcels} | Owners: ${totalOwners}`, 14, 24)

    const body = owners.slice(0, 100).map((o) => [o.owner, o.totalAreaHa.toFixed(2), o.parcelCount, o.khataCount])
    // @ts-ignore - autotable global
    doc.autoTable({
      startY: 30,
      head: [["Owner", "Total Area (ha)", "Parcels", "Khatas"]],
      body,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [5, 150, 105] },
    })
    doc.save("mrv-summary.pdf")
  }

  return (
    <button onClick={download} className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50">
      Download PDF Report
    </button>
  )
}
