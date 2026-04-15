"use client"

import Link from 'next/link'

const loginTargets = [
  { label: 'QR Code System Login', href: '/login/qr-code' },
  { label: 'Customer Management Login', href: '/login/customers' },
  { label: 'Translator Login', href: '/login/translator' },
  { label: 'AI Assistant Login', href: '/login/ai-assistant' }
]

export default function OtherGuidesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
          คู่มืออื่นๆ
        </h1>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>
          เลือกปุ่มเพื่อล็อกอินเข้าสู่ระบบคู่มืออื่นๆ ตามสิทธิ์ผู้ใช้งาน
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {loginTargets.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                textDecoration: 'none',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                padding: '14px 16px',
                fontWeight: 700,
                color: '#1f2937'
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
