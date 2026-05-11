import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Mark `resend` as optional external — it's used lazily at runtime only
  // when RESEND_API_KEY is set and a negative review arrives.
  serverExternalPackages: ['resend'],
}

export default nextConfig
