export default function Page() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="text-balance text-3xl font-semibold text-slate-900">Create your account</h1>
        <p className="text-pretty mt-1 text-slate-600">Join the MRV platform to manage projects and credits.</p>
      </div>
      {/* @ts-expect-error - dynamic import allowed */}
      {require("@/components/auth/signup-form").default()}
    </main>
  )
}
