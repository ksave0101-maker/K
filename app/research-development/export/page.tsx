"use client"

import React, { useState, useEffect } from 'react'
import { useLocale } from '@/lib/LocaleContext'
import { translations } from '@/lib/translations'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function ExportPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const t = translations[locale]
  const [dataset, setDataset] = useState('user_list')
  const [loading, setLoading] = useState(false)
  const [customSql, setCustomSql] = useState('')

  const datasets = [
    { id: 'user_list', label: locale === 'ko' ? 'ผู้ใช้ (user_list)' : 'Users (user_list)' },
    { id: 'power_records', label: locale === 'ko' ? 'บันทึกพลังงาน (power_records)' : 'Power Records (power_records)' },
    { id: 'support_tickets', label: locale === 'ko' ? 'ตั๋วสนับสนุน (support_tickets)' : 'Support Tickets (support_tickets)' },
    { id: 'custom', label: locale === 'ko' ? 'กำหนดเอง (Custom SQL)' : 'Custom SQL' }
  ]

  const download = async (format: 'csv' | 'json') => {
    setLoading(true)
    try {
      const body: any = { dataset }
      if (dataset === 'custom') body.sql = customSql
      try {
        const rawUser = typeof window !== 'undefined' ? localStorage.getItem('k_system_admin_user') : null
        const parsed = rawUser ? JSON.parse(rawUser) : null
        if (parsed?.userId) body.userId = parsed.userId
      } catch {}
      try { body.token = typeof window !== 'undefined' ? (localStorage.getItem('k_system_admin_token') || '') : '' } catch {}

      const res = await fetch('/api/research-development/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, format })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Export failed' }))
        alert(err.error || 'Export failed')
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      const ext = format === 'csv' ? 'csv' : 'json'
      a.href = url
      a.download = `export_${dataset}_${Date.now()}.${ext}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }
  // Render directly; `LocaleProvider` ensures a consistent initial locale during SSR

  return (
    <div className="min-h-screen bg-sky-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <button onClick={() => router.push('/research-development/dashboard')} className="text-cyan-600 hover:text-cyan-800 flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          {locale === 'ko' ? 'กลับไปเมนูแผนก' : 'Back to Departments'}
        </button>
        <h2 suppressHydrationWarning className="text-2xl font-bold mb-2">{locale === 'ko' ? '데이터 내보내기' : 'Export Data'}</h2>
        <p suppressHydrationWarning className="text-sm text-gray-600 mb-4">{locale === 'ko' ? '데이터를 CSV 또는 JSON 형식으로 내보낼 수 있습니다. AI 학습/전처리에 사용하세요.' : 'Export tables as CSV or JSON for AI training and data preparation.'}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '데이터셋' : 'Dataset'}</label>
            <select value={dataset} onChange={(e) => setDataset(e.target.value)} className="w-full border rounded px-3 py-2">
              {datasets.map(d => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>

          {dataset === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom SQL (SELECT only)</label>
              <textarea value={customSql} onChange={(e) => setCustomSql(e.target.value)} className="w-full border rounded px-3 py-2" rows={6} placeholder="SELECT ... LIMIT 1000" />
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => download('csv')} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded">{loading ? 'Preparing...' : (locale === 'ko' ? '내보내기 (CSV)' : 'Export CSV')}</button>
            <button onClick={() => download('json')} disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded">{loading ? 'Preparing...' : (locale === 'ko' ? '내보내기 (JSON)' : 'Export JSON')}</button>
          </div>

          <div className="text-xs text-gray-500">
            {locale === 'ko' ? '주의: Custom SQL은 SELECT 쿼리만 허용합니다. 대량 추출 시 서버/네트워크 부하에 주의하세요.' : 'Note: Custom SQL only accepts SELECT statements. Be cautious with large exports.'}
          </div>
        </div>
      </div>
    </div>
  )
}
