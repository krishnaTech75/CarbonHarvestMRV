"use client"

type Props = {
  totalAreaHa: number
  plots: number
  uniqueOwners: number
  uniqueKhatas: number
}

export function SummaryCards({ totalAreaHa, plots, uniqueOwners, uniqueKhatas }: Props) {
  const items = [
    { label: "Total area (ha)", value: totalAreaHa.toLocaleString(undefined, { maximumFractionDigits: 4 }) },
    { label: "Total plots", value: plots.toLocaleString() },
    { label: "Unique owners", value: uniqueOwners.toLocaleString() },
    { label: "Unique khatas", value: uniqueKhatas.toLocaleString() },
  ]
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((i) => (
        <div key={i.label} className="rounded-lg border p-4 bg-card">
          <div className="text-sm text-muted-foreground">{i.label}</div>
          <div className="mt-1 text-2xl font-semibold">{i.value}</div>
        </div>
      ))}
    </section>
  )
}

export default SummaryCards
