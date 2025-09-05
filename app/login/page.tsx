export default function Page() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="text-balance text-3xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-pretty mt-1 text-slate-600">Sign in to access the MRV dashboard.</p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="Agroforestry illustration" src="/agroforestry-icon.png" className="mx-auto mb-4 h-16 w-16" />
      {/* @ts-expect-error - dynamic import allowed */}
      {require("@/components/auth/login-form").default()}
    </main>
  )
}
