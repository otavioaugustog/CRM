export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <span className="text-lg font-bold tracking-tight text-primary">PipeFlow</span>
      </header>
      <main>{children}</main>
    </div>
  )
}
