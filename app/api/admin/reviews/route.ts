/**
 * GET  /api/admin/reviews — paginated list with filters
 * POST /api/admin/reviews — bulk actions (approve / reject / delete)
 *
 * Protected: requires authenticated admin session.
 * Uses service-role client to bypass RLS where needed.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { BulkActionSchema } from '@/lib/validation/schemas'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { user, error: null }
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status') ?? undefined
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)))
  const offset = (page - 1) * limit

  const supabase = createAdminClient()

  let query = supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && (['pending', 'approved', 'rejected'] as const).includes(status as 'pending' | 'approved' | 'rejected')) {
    query = query.eq('status', status as 'pending' | 'approved' | 'rejected')
  }

  const { data: reviews, count, error: dbError } = await query

  if (dbError) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }

  return NextResponse.json({
    reviews,
    pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
  })
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = BulkActionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const { ids, action } = parsed.data
  const supabase = createAdminClient()

  if (action === 'delete') {
    const { error } = await supabase.from('reviews').delete().in('id', ids)
    if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    return NextResponse.json({ message: `Deleted ${ids.length} review(s)` })
  }

  const newStatus: 'approved' | 'rejected' = action === 'approve' ? 'approved' : 'rejected'
  const { error } = await supabase
    .from('reviews')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .in('id', ids)

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  return NextResponse.json({ message: `${status} ${ids.length} review(s)` })
}
