/**
 * POST /api/reviews/upload — upload review images to Supabase Storage
 *
 * Security:
 *  - Files are renamed to UUIDs to prevent path traversal / metadata leakage
 *  - Only images (image/*) are accepted
 *  - Max 5 MB per file
 *  - Bucket policy: Restricted (only this API writes; signed URLs for reads)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const BUCKET = 'review-images'

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const files = formData.getAll('files') as File[]
  if (!files.length || files.length > 5) {
    return NextResponse.json({ error: 'Upload 1–5 images at a time' }, { status: 422 })
  }

  const supabase = createAdminClient()
  const urls: string[] = []

  for (const file of files) {
    // Validate MIME type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: `File "${file.name}" is not an image` },
        { status: 422 },
      )
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File "${file.name}" exceeds 5 MB limit` },
        { status: 422 },
      )
    }

    // Rename to UUID — prevents directory traversal & metadata leakage
    const ext = file.type.split('/')[1] ?? 'jpg'
    const safeName = `${randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(safeName, buffer, { contentType: file.type })

    if (error) {
      console.error('[upload]', error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Return a signed URL (1-hour expiry) — bucket stays Restricted
    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(safeName, 3600)

    if (signed?.signedUrl) urls.push(signed.signedUrl)
  }

  return NextResponse.json({ urls }, { status: 201 })
}
