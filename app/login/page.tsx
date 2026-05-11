'use client'

import { Suspense } from 'react'
import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
        return
      }

      router.push(next)
      router.refresh()
    })
  }

  return (
    <form id="login-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all duration-150"
          style={{
            background: 'rgba(25,24,38,0.7)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--color-royal-orchid-500)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-password" className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all duration-150"
          style={{
            background: 'rgba(25,24,38,0.7)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--color-royal-orchid-500)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="text-sm rounded-lg px-4 py-2.5"
          style={{
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.3)',
            color: '#f87171',
          }}
        >
          {error}
        </p>
      )}

      <button
        id="login-submit"
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, var(--color-royal-orchid-500), var(--color-amethyst-500))',
          color: '#fff',
        }}
      >
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      {/* Background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 30% 30%, rgba(179,50,205,0.15) 0%, transparent 65%)',
        }}
      />

      <div className="glass relative z-10 w-full max-w-md p-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold gradient-text">Admin Login</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Review Engine Command Center
          </p>
        </div>

        {/* Wrap in Suspense because LoginForm uses useSearchParams() */}
        <Suspense fallback={<div className="skeleton h-48 w-full" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
