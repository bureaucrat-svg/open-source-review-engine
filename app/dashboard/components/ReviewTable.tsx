'use client'

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { useState, useTransition, useCallback } from 'react'
import type { Review } from '@/lib/supabase/types'

const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-pending',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-sm" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}
      <span style={{ color: 'var(--color-lavender-grey-600)' }}>
        {'★'.repeat(5 - rating)}
      </span>
    </span>
  )
}

interface ReviewTableProps {
  initialData: Review[]
  total: number
  status?: string
}

export function ReviewTable({ initialData, total, status }: ReviewTableProps) {
  const [reviews, setReviews] = useState<Review[]>(initialData)
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<string | null>(null)

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k])

  const handleBulkAction = useCallback(
    (action: 'approve' | 'reject' | 'delete') => {
      if (!selectedIds.length) return

      startTransition(async () => {
        const res = await fetch('/api/admin/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds, action }),
        })

        const json = await res.json()

        if (!res.ok) {
          setFeedback(`Error: ${json.error}`)
          return
        }

        setFeedback(json.message)
        setRowSelection({})

        // Optimistic update
        if (action === 'delete') {
          setReviews((prev) => prev.filter((r) => !selectedIds.includes(r.id)))
        } else {
          const newStatus = action === 'approve' ? 'approved' : 'rejected'
          setReviews((prev) =>
            prev.map((r) =>
              selectedIds.includes(r.id) ? { ...r, status: newStatus } : r,
            ),
          )
        }

        // Clear feedback after 3s
        setTimeout(() => setFeedback(null), 3000)
      })
    },
    [selectedIds],
  )

  const columns: ColumnDef<Review>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Select all reviews"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="accent-[#b332cd]"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select review by ${row.original.reviewer_name}`}
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="accent-[#b332cd]"
        />
      ),
      size: 40,
    },
    {
      accessorKey: 'reviewer_name',
      header: 'Reviewer',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
            {row.original.reviewer_name}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {row.original.reviewer_email}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'product_title',
      header: 'Product',
      cell: ({ getValue }) => (
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ getValue }) => <StarRating rating={getValue() as number} />,
      size: 100,
    },
    {
      accessorKey: 'comment',
      header: 'Comment',
      cell: ({ getValue }) => (
        <p
          className="text-sm max-w-xs truncate"
          style={{ color: 'var(--color-text-muted)' }}
          title={getValue() as string}
        >
          {getValue() as string}
        </p>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue() as string
        return (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[s] ?? ''}`}>
            {s}
          </span>
        )
      },
      size: 100,
    },
    {
      accessorKey: 'created_at',
      header: 'Submitted',
      cell: ({ getValue }) => (
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {new Date(getValue() as string).toLocaleDateString()}
        </span>
      ),
      size: 100,
    },
  ]

  const table = useReactTable({
    data: reviews,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {selectedIds.length > 0
            ? `${selectedIds.length} of ${reviews.length} selected`
            : `${total.toLocaleString()} total reviews${status ? ` · ${status}` : ''}`}
        </p>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2" id="bulk-action-bar">
            <button
              id="bulk-approve"
              onClick={() => handleBulkAction('approve')}
              disabled={isPending}
              className="text-xs font-semibold rounded-lg px-3 py-2 transition hover:opacity-80 disabled:opacity-40"
              style={{ background: 'rgba(18,237,138,0.12)', color: 'var(--color-aquamarine-400)', border: '1px solid rgba(18,237,138,0.3)' }}
            >
              ✓ Approve
            </button>
            <button
              id="bulk-reject"
              onClick={() => handleBulkAction('reject')}
              disabled={isPending}
              className="text-xs font-semibold rounded-lg px-3 py-2 transition hover:opacity-80 disabled:opacity-40"
              style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
            >
              ✗ Reject
            </button>
            <button
              id="bulk-delete"
              onClick={() => handleBulkAction('delete')}
              disabled={isPending}
              className="text-xs font-semibold rounded-lg px-3 py-2 transition hover:opacity-80 disabled:opacity-40"
              style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}
            >
              🗑 Delete
            </button>
          </div>
        )}
      </div>

      {/* Feedback toast */}
      {feedback && (
        <p
          role="status"
          className="text-sm rounded-lg px-4 py-2.5 animate-fade-in-up"
          style={{
            background: 'rgba(18,237,138,0.1)',
            border: '1px solid rgba(18,237,138,0.3)',
            color: 'var(--color-aquamarine-400)',
          }}
        >
          {feedback}
        </p>
      )}

      {/* Table */}
      <div className="glass overflow-x-auto rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-text-muted)', width: header.getSize() }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  No reviews found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors duration-100"
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: row.getIsSelected()
                      ? 'rgba(179,50,205,0.06)'
                      : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!row.getIsSelected())
                      (e.currentTarget as HTMLElement).style.background =
                        'rgba(110,107,148,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    if (!row.getIsSelected())
                      (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
