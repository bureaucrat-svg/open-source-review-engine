/**
 * POST /api/admin/settings — upsert configuration values
 * Protected: requires authenticated admin session.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { invalidateOriginCache } from '@/lib/security/origins'
import type { Json } from '@/lib/supabase/types'

const SettingsSchema = z.object({
  auto_approve: z.boolean().optional(),
  allowed_origins: z.array(z.string().url('Each origin must be a valid URL')).optional(),
})

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = SettingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const admin = createAdminClient()
  const upserts: Array<{ key: string; value: Json }> = []

  if (parsed.data.auto_approve !== undefined) {
    upserts.push({ key: 'auto_approve', value: parsed.data.auto_approve })
  }

  if (parsed.data.allowed_origins !== undefined) {
    upserts.push({ key: 'allowed_origins', value: parsed.data.allowed_origins })
    // Bust the in-process origin cache
    invalidateOriginCache()
  }

  for (const { key, value } of upserts) {
    const { error } = await admin
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) {
      return NextResponse.json({ error: `Failed to save "${key}"` }, { status: 500 })
    }
  }

  return NextResponse.json({ message: 'Settings updated' })
}
