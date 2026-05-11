


import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/app/dashboard/components/SettingsForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: autoApproveSetting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'auto_approve')
    .single()

  const { data: originsSetting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'allowed_origins')
    .single()

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold gradient-text">Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Configure the Review Engine
        </p>
      </div>

      <SettingsForm
        autoApprove={autoApproveSetting?.value === true}
        allowedOrigins={
          Array.isArray(originsSetting?.value)
            ? (originsSetting.value as string[]).join('\n')
            : ''
        }
      />
    </div>
  )
}
