'use client'

import { useState, useTransition } from 'react'

interface SettingsFormProps {
  autoApprove: boolean
  allowedOrigins: string
}

export function SettingsForm({ autoApprove, allowedOrigins }: SettingsFormProps) {
  const [autoApproveVal, setAutoApproveVal] = useState(autoApprove)
  const [originsVal, setOriginsVal] = useState(allowedOrigins)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFeedback(null)

    startTransition(async () => {
      const origins = originsVal
        .split('\n')
        .map((o) => o.trim())
        .filter(Boolean)

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto_approve: autoApproveVal, allowed_origins: origins }),
      })

      const json = await res.json()

      if (!res.ok) {
        setFeedback({ type: 'err', msg: json.error ?? 'Save failed' })
        return
      }

      setFeedback({ type: 'ok', msg: 'Settings saved successfully.' })
      setTimeout(() => setFeedback(null), 4000)
    })
  }

  return (
    <form id="settings-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Auto-approve toggle */}
      <div className="glass p-6 flex items-start justify-between gap-6">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Auto-Approve Reviews
          </h2>
          <p className="text-xs mt-1 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>
            When <strong>ON</strong>, all incoming reviews are immediately set to{' '}
            <code style={{ color: 'var(--color-aquamarine-400)' }}>approved</code>. When{' '}
            <strong>OFF</strong>, they land in{' '}
            <code style={{ color: '#fbbf24' }}>pending</code> for manual review.
          </p>
        </div>

        {/* Toggle switch */}
        <button
          id="auto-approve-toggle"
          type="button"
          role="switch"
          aria-checked={autoApproveVal}
          onClick={() => setAutoApproveVal((v) => !v)}
          className="relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-200 shrink-0"
          style={{
            background: autoApproveVal ? 'var(--color-royal-orchid-500)' : 'var(--color-lavender-grey-700)',
          }}
        >
          <span
            className="inline-block size-5 rounded-full bg-white shadow transition-transform duration-200"
            style={{ transform: autoApproveVal ? 'translateX(22px)' : 'translateX(4px)' }}
          />
        </button>
      </div>

      {/* Allowed origins */}
      <div className="glass p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Allowed Origins
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            One origin per line (e.g. <code>https://mystore.com</code>). These are cached and checked by
            the middleware for all API requests.
          </p>
        </div>
        <textarea
          id="allowed-origins-input"
          value={originsVal}
          onChange={(e) => setOriginsVal(e.target.value)}
          rows={5}
          placeholder={`https://mystore.com\nhttps://staging.mystore.com`}
          className="w-full rounded-lg px-4 py-3 text-sm font-mono resize-none outline-none transition-all"
          style={{
            background: 'rgba(25,24,38,0.7)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--color-royal-orchid-500)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
        />
      </div>

      {/* Feedback */}
      {feedback && (
        <p
          role="status"
          className="text-sm rounded-lg px-4 py-2.5"
          style={
            feedback.type === 'ok'
              ? { background: 'rgba(18,237,138,0.1)', border: '1px solid rgba(18,237,138,0.3)', color: 'var(--color-aquamarine-400)' }
              : { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }
          }
        >
          {feedback.msg}
        </p>
      )}

      <button
        id="settings-save"
        type="submit"
        disabled={isPending}
        className="self-end rounded-xl px-6 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-40"
        style={{
          background: 'linear-gradient(135deg, var(--color-royal-orchid-500), var(--color-amethyst-500))',
          color: '#fff',
        }}
      >
        {isPending ? 'Saving…' : 'Save Settings'}
      </button>
    </form>
  )
}
