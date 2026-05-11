'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTransition } from 'react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/reviews', label: 'Reviews', icon: '💬' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  { href: '/api-docs', label: 'API Docs', icon: '📖', external: true },
]

export default function DashboardNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    })
  }

  return (
    <aside
      className="w-64 shrink-0 flex flex-col py-6 px-4 gap-2"
      style={{
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Logo */}
      <div className="px-3 mb-4">
        <span className="text-lg font-bold gradient-text">Review Engine</span>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
          {userEmail}
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = !item.external && pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150"
              style={{
                background: isActive ? 'rgba(179,50,205,0.15)' : 'transparent',
                color: isActive ? 'var(--color-royal-orchid-300)' : 'var(--color-text-muted)',
                borderLeft: isActive ? '2px solid var(--color-royal-orchid-500)' : '2px solid transparent',
              }}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.external && <span className="ml-auto text-xs opacity-50">↗</span>}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <button
        id="nav-sign-out"
        onClick={handleSignOut}
        disabled={isPending}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:opacity-80 disabled:opacity-40"
        style={{ color: '#f87171' }}
      >
        <span>🚪</span>
        {isPending ? 'Signing out…' : 'Sign out'}
      </button>
    </aside>
  )
}
