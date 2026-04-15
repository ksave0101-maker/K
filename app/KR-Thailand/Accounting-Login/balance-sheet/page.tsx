"use client"

import React, { useState, useEffect, useCallback } from 'react'
import AccWindow, { useLang } from '../components/AccWindow'

type AccItem = {
  code: string
  name_th: string
  name_en: string
  account_type: string
  sub_type: string
  balance: number
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/* ── Modern style helpers ─────────────────────────────── */
const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #d1d5db',
  borderRadius: 12,
  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  marginBottom: 14,
  overflow: 'hidden',
}

const inputStyle: React.CSSProperties = {
  width: 140,
  padding: '7px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  background: '#fff',
  fontSize: 13.5,
  fontWeight: 500,
  fontFamily: '"Sarabun","Tahoma",sans-serif',
  boxSizing: 'border-box' as const,
  outline: 'none',
}

const btnStyle: React.CSSProperties = {
  padding: '7px 18px',
  background: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: '"Sarabun","Tahoma",sans-serif',
  color: '#1f2937',
  transition: 'all 0.2s',
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#4b5563', color: '#fff',
      padding: '8px 14px', fontWeight: 700, fontSize: 13.5,
      letterSpacing: '0.01em',
    }}>{children}</div>
  )
}

function TotalRow({ label, amount, highlight = false }: { label: string; amount: number; highlight?: boolean }) {
  return (
    <tr style={{ background: highlight ? '#374151' : '#f0f1f3' }}>
      <td style={{ padding: '8px 14px', fontWeight: 700, fontSize: 13.5, color: highlight ? '#fff' : '#1f2937' }}>
        {label}
      </td>
      <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 700, fontSize: 13.5, color: highlight ? '#fff' : '#1f2937', whiteSpace: 'nowrap' as const }}>
        {fmt(amount)}
      </td>
    </tr>
  )
}

export default function BalanceSheetPage() {
  const { L } = useLang()

  const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AccItem[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/accounting/reports?type=balance-sheet')
      const d = await r.json()
      if (d.ok) setData(d.data)
    } catch (_) {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const currentAssets = data.filter(a => a.account_type === 'asset' && a.sub_type === 'current')
  const nonCurrentAssets = data.filter(a => a.account_type === 'asset' && a.sub_type === 'non_current')
  const currentLiabilities = data.filter(a => a.account_type === 'liability' && a.sub_type === 'current')
  const nonCurrentLiabilities = data.filter(a => a.account_type === 'liability' && a.sub_type === 'non_current')
  const equityAccounts = data.filter(a => a.account_type === 'equity')

  const sumGroup = (items: AccItem[]) => items.reduce((s, i) => s + (i.balance || 0), 0)

  const totalCurrentAssets = sumGroup(currentAssets)
  const totalNonCurrentAssets = sumGroup(nonCurrentAssets)
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets

  const totalCurrentLiabilities = sumGroup(currentLiabilities)
  const totalNonCurrentLiabilities = sumGroup(nonCurrentLiabilities)
  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities

  const totalEquity = sumGroup(equityAccounts)
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01

  function renderSection(
    items: AccItem[],
    titleEn: string,
    titleTh: string,
    total: number,
  ) {
    return (
      <div style={{ marginBottom: 0 }}>
        <SectionHeader>{L(titleEn, titleTh)}</SectionHeader>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {items.map(item => (
              <tr key={item.code} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '7px 14px', fontSize: 13.5, color: '#1f2937', fontWeight: 500 }}>
                  <span style={{ color: '#9ca3af', fontSize: 11.5, marginRight: 8, fontFamily: 'monospace' }}>{item.code}</span>
                  {L(item.name_en, item.name_th)}
                </td>
                <td style={{ padding: '7px 14px', textAlign: 'right', whiteSpace: 'nowrap' as const, fontSize: 13.5, fontWeight: 500, color: '#374151' }}>
                  {fmt(item.balance || 0)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={2} style={{ padding: '12px 14px', fontSize: 13, color: '#9ca3af' }}>
                {L('No accounts', 'ไม่มีรายการ')}
              </td></tr>
            )}
            <TotalRow label={L(`Total ${titleEn}`, `รวม${titleTh}`)} amount={total} />
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <AccWindow title={L('Balance Sheet', 'งบดุล') + ' — บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด'}>
      <div style={{ padding: 20, minHeight: '100%' }}>

        {/* ── Title bar ── */}
        <div style={{
          ...cardStyle,
          padding: '18px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#1f2937', letterSpacing: '0.01em' }}>
              {L('Balance Sheet', 'งบดุล')}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#4b5563' }}>{L('As of:', 'ณ วันที่:')}</span>
            <input
              type="date"
              value={reportDate}
              onChange={e => setReportDate(e.target.value)}
              style={inputStyle}
            />
            <button onClick={fetchData} style={btnStyle} disabled={loading}>
              {loading ? '...' : L('Refresh', 'โหลดใหม่')}
            </button>
            <button onClick={() => window.print()} style={btnStyle}>
              {L('Print', 'พิมพ์')}
            </button>
          </div>
        </div>

        {/* ── Data source info ── */}
        <div style={{ ...cardStyle, padding: '10px 18px', fontSize: 12.5, color: '#6b7280', fontWeight: 500 }}>
          {L('Data source: ', 'แหล่งข้อมูล: ')}
          <span style={{ fontWeight: 700, color: '#4b5563' }}>{L('Chart of Accounts + Journal Entries + Transaction Tables', 'ผังบัญชี + สมุดรายวัน + ตารางรายการ')}</span>
        </div>

        {/* ── Balance check banner ── */}
        {(totalAssets > 0 || totalLiabilitiesAndEquity > 0) && (
          <div style={{
            ...cardStyle,
            padding: '12px 18px',
            border: `1px solid ${isBalanced ? '#86efac' : '#fca5a5'}`,
            background: isBalanced ? '#f0fdf4' : '#fef2f2',
            fontWeight: 700, fontSize: 13.5,
            color: isBalanced ? '#166534' : '#991b1b',
          }}>
            {isBalanced
              ? L('Balance sheet is balanced', 'งบดุลสมดุล')
              : L(
                  `Not balanced — Assets (${fmt(totalAssets)}) ≠ Liabilities + Equity (${fmt(totalLiabilitiesAndEquity)})`,
                  `ไม่สมดุล — สินทรัพย์ (${fmt(totalAssets)}) ≠ หนี้สิน + ส่วนของเจ้าของ (${fmt(totalLiabilitiesAndEquity)})`
                )
            }
          </div>
        )}

        {/* ── Two columns ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

          {/* ASSETS */}
          <div style={cardStyle}>
            <div style={{
              background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
              padding: '12px 18px',
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: '0.01em',
            }}>
              {L('Assets', 'สินทรัพย์')}
            </div>
            <div>
              {renderSection(currentAssets, 'Current Assets', 'สินทรัพย์หมุนเวียน', totalCurrentAssets)}
              <div style={{ height: 1, background: '#e5e7eb' }} />
              {renderSection(nonCurrentAssets, 'Non-Current Assets', 'สินทรัพย์ไม่หมุนเวียน', totalNonCurrentAssets)}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <TotalRow label={L('Total Assets', 'รวมสินทรัพย์')} amount={totalAssets} highlight />
                </tbody>
              </table>
            </div>
          </div>

          {/* LIABILITIES + EQUITY */}
          <div style={cardStyle}>
            <div style={{
              background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
              padding: '12px 18px',
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: '0.01em',
            }}>
              {L('Liabilities & Equity', 'หนี้สินและส่วนของเจ้าของ')}
            </div>
            <div>
              {renderSection(currentLiabilities, 'Current Liabilities', 'หนี้สินหมุนเวียน', totalCurrentLiabilities)}
              <div style={{ height: 1, background: '#e5e7eb' }} />
              {renderSection(nonCurrentLiabilities, 'Non-Current Liabilities', 'หนี้สินไม่หมุนเวียน', totalNonCurrentLiabilities)}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 0 }}>
                <tbody>
                  <TotalRow label={L('Total Liabilities', 'รวมหนี้สิน')} amount={totalLiabilities} highlight />
                </tbody>
              </table>
              <div style={{ height: 1, background: '#e5e7eb' }} />
              {renderSection(equityAccounts, 'Equity', 'ส่วนของเจ้าของ', totalEquity)}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <TotalRow label={L('Total Liabilities & Equity', 'รวมหนี้สินและส่วนของเจ้าของ')} amount={totalLiabilitiesAndEquity} highlight />
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </AccWindow>
  )
}
