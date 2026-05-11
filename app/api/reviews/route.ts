/**
 * POST /api/reviews — submit a new review
 *
 * Security layers:
 *  - Zod schema validation + HTML stripping
 *  - Rate limit: 3 reviews/hour per IP and per email
 *  - Image UUID renaming (handled at upload time in /api/reviews/upload)
 *  - Review Gatekeeper: auto_approve setting controls status
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { ReviewSchema } from '@/lib/validation/schemas'
import { checkRateLimit } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
  // ── Parse & validate body ─────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ReviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const data = parsed.data

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  const [ipLimit, emailLimit] = await Promise.all([
    checkRateLimit(`ip:${ip}`),
    checkRateLimit(`email:${data.reviewer_email}`),
  ])

  if (!ipLimit.allowed || !emailLimit.allowed) {
    const resetAt = new Date(
      Math.max(ipLimit.resetAt.getTime(), emailLimit.resetAt.getTime()),
    )
    return NextResponse.json(
      {
        error: 'Too many reviews. Please wait before submitting again.',
        resetAt: resetAt.toISOString(),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((resetAt.getTime() - Date.now()) / 1000)),
        },
      },
    )
  }

  // ── Fetch auto_approve setting ────────────────────────────────────────────
  const supabase = createAdminClient()
  const { data: setting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'auto_approve')
    .single()

  const autoApprove = setting?.value === true
  const status = autoApprove ? 'approved' : 'pending'

  // ── Insert review ─────────────────────────────────────────────────────────
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      ...data,
      status,
      ip_address: ip,
      origin: request.headers.get('origin'),
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/reviews]', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }

  // ── Alert on negative reviews (rating <= 2) ───────────────────────────────
  if (data.rating <= 2 && process.env.RESEND_API_KEY) {
    // Fire-and-forget — don't await to keep the response fast
    sendNegativeReviewAlert(review).catch(console.error)
  }

  return NextResponse.json({ review }, { status: 201 })
}

/** Fire an alert email for negative reviews via Resend */
async function sendNegativeReviewAlert(review: {
  id: string
  product_title: string
  rating: number
  comment: string
  reviewer_name: string
}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const resendModule = require('resend') as { Resend: new (key: string) => { emails: { send: (opts: Record<string, unknown>) => Promise<unknown> } } }
    const resend = new resendModule.Resend(process.env.RESEND_API_KEY!)
    await resend.emails.send({
      from: process.env.ALERT_EMAIL_FROM ?? 'noreply@example.com',
      to: process.env.ALERT_EMAIL_TO ?? 'admin@example.com',
      subject: `⚠️ Negative Review Alert — ${review.product_title} (${review.rating}★)`,
      html: `
        <h2>Negative Review Received</h2>
        <p><strong>Product:</strong> ${review.product_title}</p>
        <p><strong>Rating:</strong> ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</p>
        <p><strong>Reviewer:</strong> ${review.reviewer_name}</p>
        <blockquote>${review.comment}</blockquote>
      `,
    })
  } catch {
    // Resend not installed — silently skip
  }
}
