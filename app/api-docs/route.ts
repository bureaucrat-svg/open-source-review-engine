/**
 * GET /api-docs — Serves the Scalar API reference UI
 * The OpenAPI spec is generated from Zod schemas in lib/validation/schemas.ts
 */
import { NextResponse } from 'next/server'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { ReviewSchema, BulkActionSchema, UpdateReviewSchema } from '@/lib/validation/schemas'

// Build OpenAPI spec dynamically from Zod schemas
function buildOpenApiSpec() {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Open Source Review Engine API',
      version: '1.0.0',
      description:
        'Secure E-commerce Review CRM API. All write endpoints require valid CORS origin. Admin endpoints require authenticated Supabase session.',
    },
    servers: [
      { url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000', description: 'Current' },
    ],
    tags: [
      { name: 'Reviews', description: 'Public review submission' },
      { name: 'Admin', description: 'Admin dashboard endpoints (auth required)' },
    ],
    paths: {
      '/api/reviews': {
        post: {
          tags: ['Reviews'],
          summary: 'Submit a review',
          description: 'Rate limited: 3 reviews per hour per IP and per email.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: zodToJsonSchema(ReviewSchema as any, { $refStrategy: 'none' }),
              },
            },
          },
          responses: {
            201: { description: 'Review created (pending or approved)' },
            422: { description: 'Validation error' },
            429: { description: 'Rate limit exceeded' },
            403: { description: 'Origin not allowed' },
          },
        },
      },
      '/api/reviews/upload': {
        post: {
          tags: ['Reviews'],
          summary: 'Upload review images',
          description: 'Upload 1–5 images (max 5 MB each). Files renamed to UUIDs.',
          requestBody: {
            required: true,
            content: { 'multipart/form-data': { schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } } },
          },
          responses: {
            201: { description: 'Array of signed image URLs' },
            422: { description: 'Invalid file type or size' },
          },
        },
      },
      '/api/admin/reviews': {
        get: {
          tags: ['Admin'],
          summary: 'List reviews (paginated)',
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          ],
          responses: {
            200: { description: 'Paginated reviews list' },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Admin'],
          summary: 'Bulk approve / reject / delete reviews',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: zodToJsonSchema(BulkActionSchema as any, { $refStrategy: 'none' }),
              },
            },
          },
          responses: {
            200: { description: 'Action applied' },
            401: { description: 'Unauthorized' },
            422: { description: 'Validation error' },
          },
        },
      },
    },
    components: {
      schemas: {
        ReviewInput: zodToJsonSchema(ReviewSchema as any, { $refStrategy: 'none' }),
        BulkAction: zodToJsonSchema(BulkActionSchema as any, { $refStrategy: 'none' }),
        UpdateReview: zodToJsonSchema(UpdateReviewSchema as any, { $refStrategy: 'none' }),
      },
      securitySchemes: {
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'sb-access-token' },
      },
    },
  }
}

export async function GET() {
  const spec = buildOpenApiSpec()

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Review Engine API Docs</title>
  <meta name="robots" content="noindex" />
  <style>body { margin: 0; }</style>
</head>
<body>
  <script
    id="api-reference"
    type="application/json"
    data-proxy-url="https://api.scalar.com/request-proxy"
  >${JSON.stringify(spec)}</script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
