/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  // output: 'standalone', // Disabled - causing CSS 404 issues
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      // Serve Thai branch pages under /Thailand while keeping KR-Thailand available
      {
        source: '/Thailand/:path*',
        destination: '/KR-Thailand/:path*',
      },
      {
        source: '/thailand/:path*',
        destination: '/KR-Thailand/:path*',
      },
    ]
  },
  async redirects() {
    return [
      // Redirect root to ngrok main-login
      {
        source: '/',
        destination: 'https://unconsumptive-nonexcitably-bobbye.ngrok-free.dev/main-login',
        permanent: false,
      },
      // Canonical URL for Thailand branch document system
      {
        source: '/KR-Thailand/Admin-Login/documents/:path*',
        destination: '/Thailand/Admin-Login/documents/:path*',
        permanent: false,
      },
    ]
  },
  async headers() {
    const headers = [
      {
        // HTML pages - never cache, always revalidate
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          { key: 'ngrok-skip-browser-warning', value: 'true' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ]

    if (isProd) {
      headers.push({
        // Static assets in production - cache forever (hashed filenames)
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      })
    } else {
      headers.push({
        // Development chunks can be regenerated; avoid stale-client cache mismatch
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      })
    }

    return headers
  },
}

module.exports = nextConfig
