import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-6">
      {/* Background glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 40%, rgba(179,50,205,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 60%, rgba(124,58,237,0.14) 0%, transparent 70%)',
        }}
      />

      {/* Hero */}
      <div className="relative z-10 max-w-3xl text-center animate-fade-in-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-8"
          style={{
            background: 'rgba(179,50,205,0.12)',
            border: '1px solid rgba(179,50,205,0.35)',
            color: '#d46eec',
          }}>
          <span className="size-2 rounded-full bg-[#12ed8a] animate-pulse inline-block" />
          Open Source · RLS-backed · Zero-trust API
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-none mb-6">
          <span className="gradient-text">Review Engine</span>
          <br />
          <span style={{ color: 'var(--color-text)' }}>Command Center</span>
        </h1>

        <p className="text-lg sm:text-xl max-w-xl mx-auto mb-10"
          style={{ color: 'var(--color-text-muted)' }}>
          A bulletproof e-commerce review CRM powered by{' '}
          <strong style={{ color: 'var(--color-text)' }}>Supabase RLS</strong>,{' '}
          strict origin enforcement, and a{' '}
          <strong style={{ color: 'var(--color-text)' }}>TanStack Table</strong> command center.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            id="cta-dashboard"
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold transition-all duration-200 hover:scale-105 animate-pulse-glow"
            style={{
              background: 'linear-gradient(135deg, var(--color-royal-orchid-500), var(--color-amethyst-500))',
              color: '#fff',
              boxShadow: '0 4px 24px rgba(179,50,205,0.35)',
            }}
          >
            Open Dashboard →
          </Link>

          <Link
            id="cta-api-docs"
            href="/api-docs"
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: 'rgba(110,107,148,0.15)',
              border: '1px solid rgba(110,107,148,0.3)',
              color: 'var(--color-text)',
            }}
          >
            API Docs
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="relative z-10 mt-20 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl w-full animate-fade-in-up"
        style={{ animationDelay: '0.15s' }}>
        {[
          {
            icon: '🔒',
            title: 'Zero-Trust Firewall',
            desc: 'Middleware-level origin whitelist. Rate limiting. Zod + XSS sanitization.',
          },
          {
            icon: '⚡',
            title: 'Review Gatekeeper',
            desc: 'Auto-approve toggle. Negative review alerts via Resend. Supabase RLS-enforced.',
          },
          {
            icon: '📊',
            title: 'Command Center',
            desc: 'TanStack Table with bulk approve/reject/delete. Filter by status. Paginated.',
          },
        ].map((f) => (
          <div key={f.title} className="glass p-6 flex flex-col gap-3 hover:border-[rgba(179,50,205,0.4)] transition-colors duration-200">
            <div className="text-3xl">{f.icon}</div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
              {f.title}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
