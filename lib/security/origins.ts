/**
 * Origin validation utilities.
 * Fetches the allowed-origins list from the Supabase `settings` table (cached).
 */
import { createAdminClient } from '@/lib/supabase/server'

let cachedOrigins: string[] | null = null
let cacheExpiry = 0
const CACHE_TTL_MS = 60_000 // 1 minute

/**
 * Returns the allowed origins list.
 * Falls back to the ALLOWED_ORIGINS env var if the table fetch fails.
 */
async function getAllowedOrigins(): Promise<string[]> {
  const now = Date.now()

  if (cachedOrigins && now < cacheExpiry) {
    return cachedOrigins
  }

  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'allowed_origins')
      .single()

    if (data?.value && Array.isArray(data.value)) {
      cachedOrigins = data.value as string[]
      cacheExpiry = now + CACHE_TTL_MS
      return cachedOrigins
    }
  } catch {
    // Fall through to env var
  }

  // Fallback: parse env variable
  const envOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  cachedOrigins = envOrigins
  cacheExpiry = now + CACHE_TTL_MS
  return cachedOrigins
}

/**
 * Validates a request origin against the whitelist.
 * Returns `true` if allowed, `false` if not.
 */
export async function isOriginAllowed(origin: string | null): Promise<boolean> {
  if (!origin) return false
  const allowed = await getAllowedOrigins()
  return allowed.includes(origin)
}

/** Invalidates the origin cache (call after updating settings) */
export function invalidateOriginCache() {
  cachedOrigins = null
  cacheExpiry = 0
}
