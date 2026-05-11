/**
 * Rate limiting utility.
 * Tracks submissions per IP or email — 3 reviews per hour max.
 * Implemented using the `rate_limits` Supabase table.
 */
import { createAdminClient } from '@/lib/supabase/server'

const WINDOW_SECONDS = Number(process.env.RATE_LIMIT_WINDOW ?? 3600)
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX ?? 3)

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const supabase = createAdminClient()
  const now = new Date()
  const windowStart = new Date(now.getTime() - WINDOW_SECONDS * 1000)

  // Clean up expired entries for this identifier
  await supabase
    .from('rate_limits')
    .delete()
    .eq('identifier', identifier)
    .lt('window_start', windowStart.toISOString())

  // Count requests in current window
  const { data: existing } = await supabase
    .from('rate_limits')
    .select('count, window_start')
    .eq('identifier', identifier)
    .gte('window_start', windowStart.toISOString())
    .order('window_start', { ascending: true })
    .limit(1)
    .single()

  if (!existing) {
    // First request in this window
    await supabase.from('rate_limits').insert({
      identifier,
      count: 1,
      window_start: now.toISOString(),
    })
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetAt: new Date(now.getTime() + WINDOW_SECONDS * 1000),
    }
  }

  const resetAt = new Date(
    new Date(existing.window_start).getTime() + WINDOW_SECONDS * 1000,
  )

  if (existing.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt }
  }

  // Increment count
  await supabase
    .from('rate_limits')
    .update({ count: existing.count + 1 })
    .eq('identifier', identifier)
    .gte('window_start', windowStart.toISOString())

  return {
    allowed: true,
    remaining: MAX_REQUESTS - (existing.count + 1),
    resetAt,
  }
}
