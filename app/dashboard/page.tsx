import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Overview' }

async function getStats() {
  const supabase = await createClient()
  const [pending, approved, rejected] = await Promise.all([
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
  ])
  return {
    pending: pending.count ?? 0,
    approved: approved.count ?? 0,
    rejected: rejected.count ?? 0,
    total: (pending.count ?? 0) + (approved.count ?? 0) + (rejected.count ?? 0),
  }
}

export default async function DashboardOverviewPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Total Reviews', value: stats.total, icon: '📝', color: 'var(--color-royal-orchid-400)' },
    { label: 'Pending Review', value: stats.pending, icon: '⏳', color: '#fbbf24' },
    { label: 'Approved', value: stats.approved, icon: '✅', color: 'var(--color-aquamarine-400)' },
    { label: 'Rejected', value: stats.rejected, icon: '🚫', color: '#f87171' },
  ]

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold gradient-text">Overview</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Real-time review metrics
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="glass p-6 flex flex-col gap-3 hover:scale-[1.02] transition-transform duration-200">
            <span className="text-2xl">{card.icon}</span>
            <p className="text-3xl font-bold" style={{ color: card.color }}>
              {card.value.toLocaleString()}
            </p>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 glass p-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/dashboard/reviews?status=pending"
            id="quick-pending"
            className="rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
          >
            Review {stats.pending} pending →
          </a>
          <a
            href="/api-docs"
            target="_blank"
            id="quick-api-docs"
            className="rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'rgba(179,50,205,0.12)', color: 'var(--color-royal-orchid-300)', border: '1px solid rgba(179,50,205,0.3)' }}
          >
            View API Docs ↗
          </a>
        </div>
      </div>
    </div>
  )
}
