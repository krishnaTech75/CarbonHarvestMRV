"use client"

export function DownloadCSV({
  filename,
  rows,
}: {
  filename: string
  rows: Record<string, string | number>[]
}) {
  function download() {
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <button className="rounded-md border px-3 py-2 text-sm" onClick={download}>
      Download CSV
    </button>
  )
}

function toCSV(rows: Record<string, string | number>[]) {
  if (!rows.length) return ""
  const headers = Object.keys(rows[0])
  const lines = [headers.join(",")]
  for (const r of rows) {
    lines.push(headers.map((h) => escapeCSV(String(r[h] ?? ""))).join(","))
  }
  return lines.join("\n")
}

function escapeCSV(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}
