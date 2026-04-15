"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/LocaleContext'
import { translations } from '@/lib/translations'

type User = {
  userId?: number
  username?: string
  name?: string
  email?: string
  site?: string
  typeID?: number
}

export default function Header() {
  const { locale } = useLocale()
  const t = translations[locale]
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (!raw) return
      const parsed = JSON.parse(raw)
      setUser(parsed)

      // Verify with server to get current DB-backed name (best-effort)
      if (parsed?.userId) {
        fetch('/api/user/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: Number(parsed.userId) })
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.success && data.user) {
              setUser((prev) => ({ ...parsed, ...data.user }))
            }
          })
          .catch(() => {})
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const handleLogout = () => {
    try {
      localStorage.removeItem('k_system_admin_user')
      localStorage.removeItem('k_system_admin_token')
    } catch {}
    // Redirect to login
    try { window.location.href = '/Korea/Admin-Login' } catch { }
  }

  return (
    <header className="w-full bg-white border-b border-gray-200 py-2 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/korea-main" className="text-lg font-semibold text-slate-800">{t?.systemName || 'Korea Management System'}</Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-700">สวัสดี, <span className="font-medium">{user.name || user.username}</span></div>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        ) : (
          <Link href="/Korea/Admin-Login" className="text-sm text-gray-600">Sign in</Link>
        )}
      </div>
    </header>
  )
}
