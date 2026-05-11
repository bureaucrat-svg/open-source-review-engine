/**
 * Zod validation schemas for all API payloads.
 * Strip HTML tags to prevent Stored XSS.
 */
import { z } from 'zod'

/** Strips HTML/script tags from a string */
const stripHtml = (str: string) =>
  str.replace(/<[^>]*>/g, '').trim()

export const ReviewSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required').max(255),
  product_title: z.string().min(1).max(255),
  reviewer_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .transform(stripHtml),
  reviewer_email: z.email('Must be a valid email address'),
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(2000)
    .transform(stripHtml),
  images: z.array(z.string().url()).max(5).optional().default([]),
})

export type ReviewInput = z.infer<typeof ReviewSchema>

export const BulkActionSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one ID is required').max(100),
  action: z.enum(['approve', 'reject', 'delete']),
})

export type BulkActionInput = z.infer<typeof BulkActionSchema>

export const UpdateReviewSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  comment: z
    .string()
    .min(10)
    .max(2000)
    .transform(stripHtml)
    .optional(),
})

export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>
