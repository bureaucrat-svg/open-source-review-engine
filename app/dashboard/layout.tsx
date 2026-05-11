import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from './components/DashboardNav'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Review Engine admin dashboard',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/dashboard')
  }

  return (
    <div className="flex min-h-dvh">
      <DashboardNav userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
    </div>
  )
}
