import { createClient } from '@/lib/supabase/server'
import { ReviewTable } from '../components/ReviewTable'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reviews' }

const STATUS_OPTIONS = ['all', 'pending', 'approved', 'rejected']

interface ReviewsPageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const params = await searchParams
  const validStatuses = ['pending', 'approved', 'rejected'] as const
  type ValidStatus = typeof validStatuses[number]
  const status: ValidStatus | undefined =
    validStatuses.includes(params.status as ValidStatus) && params.status !== 'all'
      ? (params.status as ValidStatus)
      : undefined
  const page = Math.max(1, Number(params.page ?? 1))
  const limit = 20
  const offset = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data: reviews, count } = await query
  const total = count ?? 0
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Reviews</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Manage and moderate customer reviews
          </p>
        </div>

        {/* Status filter tabs */}
        <div
          id="status-filter"
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {STATUS_OPTIONS.map((s) => {
            const isActive = (params.status ?? 'all') === s
            return (
              <Link
                key={s}
                href={`/dashboard/reviews?status=${s}`}
                id={`filter-${s}`}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 capitalize"
                style={{
                  background: isActive ? 'rgba(179,50,205,0.2)' : 'transparent',
                  color: isActive ? 'var(--color-royal-orchid-300)' : 'var(--color-text-muted)',
                }}
              >
                {s}
              </Link>
            )
          })}
        </div>
      </div>

      <ReviewTable
        initialData={reviews ?? []}
        total={total}
        status={status}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          id="pagination"
          className="mt-6 flex items-center justify-between text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <p>
            Page {page} of {totalPages} ({total} reviews)
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/dashboard/reviews?${new URLSearchParams({ ...(status ? { status } : {}), page: String(page - 1) })}`}
                id="pagination-prev"
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              >
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/dashboard/reviews?${new URLSearchParams({ ...(status ? { status } : {}), page: String(page + 1) })}`}
                id="pagination-next"
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
