export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <span className="text-lg font-bold tracking-tight text-indigo-600">PipeFlow</span>
      </header>
      <main>{children}</main>
    </div>
  )
}
