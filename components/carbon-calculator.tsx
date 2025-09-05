"use client"

import type React from "react"
import { useMemo, useState } from "react"
import type { Parcel } from "@/lib/types"
import { round4 } from "@/lib/aggregate"
import { usePlants } from "@/hooks/use-plants"

type Props = { parcels: Parcel[] }

export function CarbonCalculator({ parcels }: Props) {
  // Base area computations
  const totalAreaHa = useMemo(
    () => round4(parcels.reduce((s, p) => s + (Number.isFinite(p.area) ? p.area : 0), 0)),
    [parcels],
  )

  // Agroforestry inputs
  const [afShare, setAfShare] = useState(100) // % of area under agroforestry
  const [afRate, setAfRate] = useState(3.5) // tCO2e/ha/yr (rate method)
  const [useSpecies, setUseSpecies] = useState(false)

  // Species method inputs
  const { plants } = usePlants()
  const [species, setSpecies] = useState<string>("")
  const selected = plants.find((p) => p.commonName === species)
  const [dailyKg, setDailyKg] = useState<number>(0.05) // fallback if none selected
  const [treesPerHa, setTreesPerHa] = useState(200)
  const [survivalPct, setSurvivalPct] = useState(85)
  const [speciesShare, setSpeciesShare] = useState(100) // % of AF area using species calc

  // Rice inputs
  const [riceRate, setRiceRate] = useState(1.2) // tCO2e/ha/season
  const [riceSeasons, setRiceSeasons] = useState(1)
  const [riceShare, setRiceShare] = useState(50) // % of area under rice practice

  // Deductions
  const [bufferPct, setBufferPct] = useState(20)
  const [leakagePct, setLeakagePct] = useState(5)
  const [discountPct, setDiscountPct] = useState(10)

  // Economics
  const [price, setPrice] = useState(10) // USD/tCO2e
  const [registryFeePct, setRegistryFeePct] = useState(3)
  const [developerSharePct, setDeveloperSharePct] = useState(15)
  const [verificationCostPerT, setVerificationCostPerT] = useState(0.5) // USD per tCO2e
  const [farmerCostPerHa, setFarmerCostPerHa] = useState(5) // USD/ha/yr (inputs, ops)

  // Areas
  const afAreaHa = useMemo(() => round4((totalAreaHa * afShare) / 100), [totalAreaHa, afShare])
  const riceAreaHa = useMemo(() => round4((totalAreaHa * riceShare) / 100), [totalAreaHa, riceShare])

  // Agroforestry CO2e
  const speciesDailyKg = useMemo(() => {
    if (selected?.estimatedDailyCarbonAbsorptionKg != null) return selected.estimatedDailyCarbonAbsorptionKg
    return dailyKg
  }, [selected, dailyKg])

  const speciesPerHaT = useMemo(() => {
    // kg/day/tree * 365 / 1000 => t/year/tree
    const tPerTreeYr = ((speciesDailyKg || 0) * 365.0) / 1000.0
    const survival = Math.max(0, Math.min(100, survivalPct)) / 100
    return round4(tPerTreeYr * treesPerHa * survival)
  }, [speciesDailyKg, treesPerHa, survivalPct])

  const afAreaSpeciesHa = useMemo(
    () => round4((afAreaHa * (useSpecies ? speciesShare : 0)) / 100),
    [afAreaHa, useSpecies, speciesShare],
  )

  const agroCO2eSpecies = useMemo(() => round4(afAreaSpeciesHa * speciesPerHaT), [afAreaSpeciesHa, speciesPerHaT])

  const afAreaRateHa = useMemo(() => round4(afAreaHa - afAreaSpeciesHa), [afAreaHa, afAreaSpeciesHa])

  const agroCO2eRate = useMemo(() => round4(afAreaRateHa * afRate), [afAreaRateHa, afRate])

  const agroCO2e = useMemo(() => round4(agroCO2eSpecies + agroCO2eRate), [agroCO2eSpecies, agroCO2eRate])

  // Rice CO2e
  const riceCO2e = useMemo(() => round4(riceAreaHa * riceRate * riceSeasons), [riceAreaHa, riceRate, riceSeasons])

  // Gross and issued credits
  const grossCO2e = useMemo(() => round4(agroCO2e + riceCO2e), [agroCO2e, riceCO2e])
  const afterBuffer = useMemo(
    () => round4(grossCO2e * (1 - Math.max(0, Math.min(100, bufferPct)) / 100)),
    [grossCO2e, bufferPct],
  )
  const afterLeakage = useMemo(
    () => round4(afterBuffer * (1 - Math.max(0, Math.min(100, leakagePct)) / 100)),
    [afterBuffer, leakagePct],
  )
  const issuedCO2e = useMemo(
    () => round4(afterLeakage * (1 - Math.max(0, Math.min(100, discountPct)) / 100)),
    [afterLeakage, discountPct],
  )

  // Economics
  const grossRevenue = useMemo(() => round4(issuedCO2e * price), [issuedCO2e, price])
  const registryFee = useMemo(
    () => round4(grossRevenue * (Math.max(0, Math.min(100, registryFeePct)) / 100)),
    [grossRevenue, registryFeePct],
  )
  const developerShare = useMemo(
    () => round4(grossRevenue * (Math.max(0, Math.min(100, developerSharePct)) / 100)),
    [grossRevenue, developerSharePct],
  )
  const verificationCost = useMemo(
    () => round4(issuedCO2e * Math.max(0, verificationCostPerT)),
    [issuedCO2e, verificationCostPerT],
  )
  const farmerCosts = useMemo(() => round4(totalAreaHa * Math.max(0, farmerCostPerHa)), [totalAreaHa, farmerCostPerHa])

  const totalCosts = useMemo(
    () => round4(registryFee + developerShare + verificationCost + farmerCosts),
    [registryFee, developerShare, verificationCost, farmerCosts],
  )
  const farmerNet = useMemo(() => round4(grossRevenue - totalCosts), [grossRevenue, totalCosts])
  const netPerHa = useMemo(() => round4(totalAreaHa > 0 ? farmerNet / totalAreaHa : 0), [farmerNet, totalAreaHa])

  return (
    <section className="rounded-lg border">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/40">
        <h3 className="text-sm font-medium">Carbon & Profit Calculator</h3>
        <div className="text-xs text-muted-foreground">Applies to current result set</div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 p-4">
        {/* Inputs */}
        <div className="space-y-5">
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Agroforestry</legend>
            <Field label="AF area share (%)">
              <NumberInput value={afShare} onChange={setAfShare} step={1} min={0} max={100} />
            </Field>
            <div className="flex items-center gap-2">
              <input
                id="useSpecies"
                type="checkbox"
                checked={useSpecies}
                onChange={(e) => setUseSpecies(e.target.checked)}
              />
              <label htmlFor="useSpecies" className="text-sm">
                Use species-based calculation
              </label>
            </div>
            {!useSpecies && (
              <Field label="AF rate (tCO2e/ha/yr)">
                <NumberInput value={afRate} onChange={setAfRate} step={0.1} min={0} />
              </Field>
            )}
            {useSpecies && (
              <div className="grid gap-3">
                <Field label="Species (optional)">
                  <select
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                    value={species}
                    onChange={(e) => {
                      const name = e.target.value
                      setSpecies(name)
                    }}
                  >
                    <option value="">— Select species —</option>
                    {plants.map((p) => (
                      <option key={p.commonName} value={p.commonName}>
                        {p.commonName} ({p.estimatedDailyCarbonAbsorptionKg} kg/day)
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Daily CO2 per tree (kg/day)">
                  <NumberInput
                    value={species ? (selected?.estimatedDailyCarbonAbsorptionKg ?? dailyKg) : dailyKg}
                    onChange={setDailyKg}
                    step={0.001}
                    min={0}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Trees per ha">
                    <NumberInput value={treesPerHa} onChange={setTreesPerHa} step={1} min={0} />
                  </Field>
                  <Field label="Survival (%)">
                    <NumberInput value={survivalPct} onChange={setSurvivalPct} step={1} min={0} max={100} />
                  </Field>
                </div>
                <Field label="Species share of AF area (%)">
                  <NumberInput value={speciesShare} onChange={setSpeciesShare} step={1} min={0} max={100} />
                </Field>
              </div>
            )}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Rice methane reduction</legend>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rice rate (tCO2e/ha/season)">
                <NumberInput value={riceRate} onChange={setRiceRate} step={0.1} min={0} />
              </Field>
              <Field label="Seasons per year">
                <NumberInput value={riceSeasons} onChange={setRiceSeasons} step={1} min={0} />
              </Field>
            </div>
            <Field label="Rice area share (%)">
              <NumberInput value={riceShare} onChange={setRiceShare} step={1} min={0} max={100} />
            </Field>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Deductions</legend>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Buffer (%)">
                <NumberInput value={bufferPct} onChange={setBufferPct} step={1} min={0} max={100} />
              </Field>
              <Field label="Leakage (%)">
                <NumberInput value={leakagePct} onChange={setLeakagePct} step={1} min={0} max={100} />
              </Field>
              <Field label="Discount (%)">
                <NumberInput value={discountPct} onChange={setDiscountPct} step={1} min={0} max={100} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Economics</legend>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Carbon price (USD/tCO2e)">
                <NumberInput value={price} onChange={setPrice} step={1} min={0} />
              </Field>
              <Field label="Verification cost (USD/tCO2e)">
                <NumberInput value={verificationCostPerT} onChange={setVerificationCostPerT} step={0.1} min={0} />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Registry fee (%)">
                <NumberInput value={registryFeePct} onChange={setRegistryFeePct} step={0.5} min={0} max={100} />
              </Field>
              <Field label="Developer share (%)">
                <NumberInput value={developerSharePct} onChange={setDeveloperSharePct} step={0.5} min={0} max={100} />
              </Field>
              <Field label="Farmer cost (USD/ha/yr)">
                <NumberInput value={farmerCostPerHa} onChange={setFarmerCostPerHa} step={0.5} min={0} />
              </Field>
            </div>
          </fieldset>
        </div>

        {/* Outputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <KPI label="Total area (ha)" value={totalAreaHa} />
            <KPI label="AF area (ha)" value={afAreaHa} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <KPI label="Rice area (ha)" value={riceAreaHa} />
            <KPI label="Species t/ha/yr" value={speciesPerHaT} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <KPI label="AF CO2e (t/yr)" value={agroCO2e} />
            <KPI label="Rice CO2e (t/yr)" value={riceCO2e} />
          </div>
          <KPI label="Gross CO2e (t/yr)" value={grossCO2e} />
          <div className="grid grid-cols-3 gap-3">
            <KPI label="After buffer (t/yr)" value={afterBuffer} />
            <KPI label="After leakage (t/yr)" value={afterLeakage} />
            <KPI label="Issued (t/yr)" value={issuedCO2e} emphasis />
          </div>
          <KPI label="Gross revenue (USD/yr)" value={grossRevenue} />
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium mb-2">Cost breakdown (USD/yr)</div>
            <ul className="grid grid-cols-2 gap-2">
              <li className="flex items-center justify-between">
                <span>Registry fee</span>
                <span>{fmt(registryFee)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Developer share</span>
                <span>{fmt(developerShare)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Verification</span>
                <span>{fmt(verificationCost)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Farmer costs</span>
                <span>{fmt(farmerCosts)}</span>
              </li>
            </ul>
            <div className="mt-2 flex items-center justify-between border-t pt-2">
              <span className="font-medium">Total costs</span>
              <span className="font-medium">{fmt(totalCosts)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <KPI label="Farmer net (USD/yr)" value={farmerNet} emphasis />
            <KPI label="Net per ha (USD/ha/yr)" value={netPerHa} />
          </div>
          <p className="text-xs text-muted-foreground">
            Notes: Inputs are illustrative and should be replaced with methodology- and region-specific factors. Species
            values are approximate; real projects quantify at plot/stratum level.
          </p>
        </div>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function KPI({ label, value, emphasis }: { label: string; value: number; emphasis?: boolean }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={emphasis ? "text-2xl font-semibold" : "text-xl font-semibold"}>
        {value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
      </div>
    </div>
  )
}

function NumberInput({
  value,
  onChange,
  step,
  min,
  max,
}: {
  value: number
  onChange: (n: number) => void
  step?: number
  min?: number
  max?: number
}) {
  return (
    <input
      type="number"
      className="rounded-md border bg-background px-3 py-2"
      value={Number.isFinite(value) ? value : 0}
      step={step ?? 1}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
    />
  )
}

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export default CarbonCalculator
