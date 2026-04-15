"use client"

import React, { useEffect, useState } from 'react'

export default function CreatedBy({ label = 'Created By' }: { label?: string }) {
  const [name, setName] = useState<string | null>(null)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        try {
          const u = JSON.parse(raw)
          setName(u?.name || u?.fullname || u?.username || String(u?.userId || ''))
          return
        } catch (_e) {}
      }
      const alt = localStorage.getItem('k_system_admin_user_name') || localStorage.getItem('k_system_admin_user')
      setName(alt || null)
    } catch (_) { setName(null) }
  }, [])

  return (
    <div style={{ marginBottom: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 13 }}>
      <strong>{label}:</strong> {name || '-'}
    </div>
  )
}
