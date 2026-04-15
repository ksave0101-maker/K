"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react'
import AdminLayout from '../components/AdminLayout'

type TrackRecord = {
  trackID: number; trackNo: string; orderID: number | null; orderNo: string | null
  orderDescription: string; supplierName: string; orderDate: string
  shippingMethod: string; trackingNumber: string; containerNo: string
  status: string; estimatedDeparture: string; actualDeparture: string
  estimatedArrival: string; actualArrival: string
  customsStatus: string; customsNotes: string; warehouseLocation: string
  serial_number: string; lot_number: string
  itemsSummary: string; totalValue: number; notes: string
  thailand_tracking_no: string; thailand_carrier: string; thailand_delivery_status: string
  thailand_est_delivery: string; thailand_actual_delivery: string
  thailand_delivery_address: string; thailand_delivery_notes: string
  pr_id: number | null; pdo_id: number | null
  created_by: string; created_at: string; updated_at: string
}

type PO = { orderID: number; orderNo: string; customer_name: string; priceTotal: number; status: string }
type PR = { prID: number; prNo: string; department: string; requested_by: string; status: string; total_amount: number; prDate: string }
type PDO = { pdoID: number; pdoNo: string; product_code: string; product_name: string; quantity_ordered: number; unit: string; status: string; pdoDate: string }

const emptyForm = {
  orderID: '', orderNo: '', orderDescription: '', supplierName: 'Korea HQ', orderDate: '',
  shippingMethod: 'sea', trackingNumber: '', containerNo: '', status: 'arrived',
  estimatedDeparture: '', actualDeparture: '', estimatedArrival: '', actualArrival: new Date().toISOString().split('T')[0],
  customsStatus: 'cleared', customsNotes: '', warehouseLocation: '',
  serial_number: '', lot_number: '',
  itemsSummary: '', totalValue: '', notes: '',
  thailand_tracking_no: '', thailand_carrier: '', thailand_delivery_status: 'preparing',
  thailand_est_delivery: '', thailand_actual_delivery: '', thailand_delivery_address: '', thailand_delivery_notes: '',
  pr_id: '', pdo_id: '', pdoNo: ''
}

const statusFlow = ['ordered', 'confirmed', 'manufacturing', 'shipped', 'customs', 'arrived', 'domestic_shipping', 'domestic_delivered', 'delivery_problem'] as const

const statusMap: Record<string, { en: string; th: string; color: string; bg: string }> = {
  ordered:       { en: 'Production Ordered', th: 'สั่งผลิตแล้ว',      color: '#92400e', bg: '#fef3c7' },
  confirmed:     { en: 'Confirmed',     th: 'ยืนยันแล้ว',        color: '#1e40af', bg: '#dbeafe' },
  manufacturing: { en: 'Manufacturing', th: 'กำลังผลิต',         color: '#7c2d12', bg: '#ffedd5' },
  shipped:       { en: 'Shipped',       th: 'จัดส่งแล้ว',        color: '#155e75', bg: '#cffafe' },
  customs:       { en: 'Customs',       th: 'ตรวจศุลกากร',       color: '#581c87', bg: '#f3e8ff' },
  arrived:           { en: 'Arrived',           th: 'ถึงไทยแล้ว',              color: '#065f46', bg: '#d1fae5' },
  domestic_shipping: { en: 'Domestic Shipping', th: 'กำลังจัดส่งในประเทศ',     color: '#1e40af', bg: '#dbeafe' },
  domestic_delivered:{ en: 'Domestic Delivered',th: 'จัดส่งในประเทศสำเร็จ',    color: '#166534', bg: '#bbf7d0' },
  delivery_problem:  { en: 'Delivery Problem', th: 'เกิดปัญหาการจัดส่ง',     color: '#991b1b', bg: '#fee2e2' },
  cancelled:     { en: 'Cancelled',     th: 'ยกเลิก',            color: '#991b1b', bg: '#fee2e2' },
}

const shippingIcons: Record<string, string> = { sea: '🚢', air: '✈️', land: '🚛', ems: '📦' }
const shippingLabels: Record<string, { en: string; th: string }> = {
  sea: { en: 'Sea Freight', th: 'ทางเรือ' }, air: { en: 'Air Freight', th: 'ทางอากาศ' },
  land: { en: 'Land Transport', th: 'ทางบก' }, ems: { en: 'EMS/Parcel', th: 'พัสดุ/EMS' }
}

const customsLabels: Record<string, { en: string; th: string }> = {
  none: { en: 'N/A', th: 'ไม่มี' }, pending: { en: 'Pending', th: 'รอตรวจ' },
  inspecting: { en: 'Inspecting', th: 'กำลังตรวจ' }, cleared: { en: 'Cleared', th: 'ผ่านแล้ว' },
  held: { en: 'Held', th: 'ถูกกัก' }
}

export default function KoreaOrderTrackingPage() {
  const [lang, setLang] = useState<'en' | 'th'>('th')
  const [mounted, setMounted] = useState(false)
  const [records, setRecords] = useState<TrackRecord[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PO[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editID, setEditID] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedID, setExpandedID] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [poSearch, setPoSearch] = useState('')
  const [pdos, setPdos] = useState<PDO[]>([])
  const [pdoSearch, setPdoSearch] = useState('')
  const [formMode, setFormMode] = useState<'export' | 'receipt'>('export')
  const [showScanner, setShowScanner] = useState(false)
  const scannerRef = useRef<HTMLDivElement>(null)

  const L = (en: string, th: string) => (mounted ? lang : 'th') === 'th' ? th : en

  useEffect(() => {
    setMounted(true)
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLang(l)
    } catch (_) {}
    const handler = (e: any) => {
      const v = e.detail?.locale || e.detail
      if (v === 'en' || v === 'th') setLang(v)
    }
    window.addEventListener('locale-changed', handler)
    window.addEventListener('k-system-lang', handler)
    return () => { window.removeEventListener('locale-changed', handler); window.removeEventListener('k-system-lang', handler) }
  }, [])

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/korea-order-tracking')
      const j = await res.json()
      if (j.ok) setRecords(j.data || [])
    } catch (_) {}
    setLoading(false)
  }, [])

  const fetchPOs = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/mysql-proxy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'SELECT orderID, orderNo, customer_name, priceTotal, status FROM purchase_orders ORDER BY orderID DESC LIMIT 100' })
      })
      const j = await res.json()
      if (j.data) setPurchaseOrders(j.data)
    } catch (_) {}
  }, [])

  const fetchPDOs = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/mysql-proxy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'SELECT pdoID, pdoNo, product_code, product_name, quantity_ordered, unit, status, pdoDate FROM purchase_detail_orders ORDER BY pdoID DESC LIMIT 200' })
      })
      const j = await res.json()
      if (j.data) setPdos(j.data)
    } catch (_) {}
  }, [])

  useEffect(() => { fetchRecords(); fetchPOs(); fetchPDOs() }, [fetchRecords, fetchPOs, fetchPDOs])

  useEffect(() => {
    if (!showScanner) return
    let scanner: any = null
    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        scanner = new Html5Qrcode('qr-scanner-region')
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            const parts = decodedText.split(/[,|\n\t]/).map(s => s.trim()).filter(Boolean)
            if (parts.length >= 2) {
              setForm(f => ({ ...f, serial_number: parts[0], lot_number: parts[1] }))
            } else {
              setForm(f => ({ ...f, serial_number: decodedText }))
            }
            setShowScanner(false)
          },
          () => {}
        )
      } catch (err) {
        console.error('QR Scanner error:', err)
      }
    }
    startScanner()
    return () => {
      if (scanner) {
        scanner.stop().catch(() => {})
      }
    }
  }, [showScanner])

  const openExport = () => { setEditID(null); setForm({ ...emptyForm, status: 'ordered' }); setFormMode('export'); setPoSearch(''); setPdoSearch(''); setShowScanner(false); setShowForm(true) }
  const openReceipt = () => { setEditID(null); setForm({ ...emptyForm, status: 'arrived' }); setFormMode('receipt'); setPoSearch(''); setPdoSearch(''); setShowScanner(false); setShowForm(true) }

  const openEdit = (rec: TrackRecord) => {
    setEditID(rec.trackID)
    setForm({
      orderID: rec.orderID ? String(rec.orderID) : '', orderNo: rec.orderNo || '',
      orderDescription: rec.orderDescription || '', supplierName: rec.supplierName || 'Korea HQ',
      orderDate: rec.orderDate ? rec.orderDate.split('T')[0] : '',
      shippingMethod: rec.shippingMethod || 'sea', trackingNumber: rec.trackingNumber || '',
      containerNo: rec.containerNo || '', status: rec.status || 'ordered',
      estimatedDeparture: rec.estimatedDeparture ? rec.estimatedDeparture.split('T')[0] : '',
      actualDeparture: rec.actualDeparture ? rec.actualDeparture.split('T')[0] : '',
      estimatedArrival: rec.estimatedArrival ? rec.estimatedArrival.split('T')[0] : '',
      actualArrival: rec.actualArrival ? rec.actualArrival.split('T')[0] : '',
      customsStatus: rec.customsStatus || 'none', customsNotes: rec.customsNotes || '',
      warehouseLocation: rec.warehouseLocation || '', itemsSummary: rec.itemsSummary || '',
      serial_number: rec.serial_number || '', lot_number: rec.lot_number || '',
      totalValue: rec.totalValue ? String(rec.totalValue) : '', notes: rec.notes || '',
      thailand_tracking_no: rec.thailand_tracking_no || '', thailand_carrier: rec.thailand_carrier || '',
      thailand_delivery_status: rec.thailand_delivery_status || 'pending',
      thailand_est_delivery: rec.thailand_est_delivery ? rec.thailand_est_delivery.split('T')[0] : '',
      thailand_actual_delivery: rec.thailand_actual_delivery ? rec.thailand_actual_delivery.split('T')[0] : '',
      thailand_delivery_address: rec.thailand_delivery_address || '',
      thailand_delivery_notes: rec.thailand_delivery_notes || '',
      pr_id: rec.pr_id ? String(rec.pr_id) : '',
      pdo_id: rec.pdo_id ? String(rec.pdo_id) : '',
      pdoNo: rec.pdo_id ? `PDO-${rec.pdo_id}` : ''
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.orderDescription && !form.itemsSummary) {
      alert(L('Please enter order description or items', 'กรุณากรอกรายละเอียดสินค้า'))
      return
    }
    if (formMode === 'receipt') {
      if (!form.thailand_delivery_address) {
        alert(L('Please enter delivery address in Thailand', 'กรุณากรอกที่อยู่จัดส่งในไทย'))
        return
      }
      if (!form.thailand_carrier) {
        alert(L('Please select delivery carrier', 'กรุณาเลือกบริษัทขนส่ง'))
        return
      }
    }
    setSaving(true)
    try {
      const payload: any = { ...form }
      if (payload.orderID) payload.orderID = parseInt(payload.orderID)
      if (payload.totalValue) payload.totalValue = parseFloat(payload.totalValue)
      if (editID) {
        payload.trackID = editID
        await fetch('/api/korea-order-tracking', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      } else {
        await fetch('/api/korea-order-tracking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      }
      setShowForm(false); fetchRecords()
    } catch (_) { alert('Error saving') }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm(L('Delete this record?', 'ต้องการลบรายการนี้?'))) return
    await fetch(`/api/korea-order-tracking?id=${id}`, { method: 'DELETE' })
    fetchRecords()
  }

  const handlePOSelect = (po: PO) => {
    setForm(f => ({
      ...f,
      orderID: String(po.orderID),
      orderNo: po.orderNo,
      orderDescription: f.orderDescription || `PO: ${po.orderNo} - ${po.customer_name}`,
      totalValue: po.priceTotal ? String(po.priceTotal) : f.totalValue
    }))
    setPoSearch('')
  }

  const handlePDOSelect = (pdo: PDO) => {
    setForm(f => ({
      ...f,
      pdo_id: String(pdo.pdoID),
      pdoNo: pdo.pdoNo,
      itemsSummary: f.itemsSummary || `PDO: ${pdo.pdoNo} - ${pdo.product_name} (${pdo.quantity_ordered} ${pdo.unit})`
    }))
    setPdoSearch('')
  }

  const handleExport = () => {
    const rows = filtered
    if (!rows.length) { alert(L('No records to export', 'ไม่มีข้อมูลให้ส่งออก')); return }
    const headers = [
      'Track No', 'Order No', 'Description', 'Supplier', 'Order Date',
      'Shipping Method', 'Tracking No', 'Container/AWB', 'Status',
      'Est. Departure', 'Actual Departure', 'Est. Arrival', 'Actual Arrival',
      'Customs Status', 'Customs Notes', 'Warehouse', 'Serial No.', 'Lot No.',
      'Items Summary', 'Total Value (THB)', 'Notes',
      'TH Tracking No', 'TH Carrier', 'TH Delivery Status',
      'TH Est. Delivery', 'TH Actual Delivery', 'TH Delivery Address', 'TH Delivery Notes',
      'Created By', 'Created At'
    ]
    const fmt = (v: any) => {
      if (v === null || v === undefined) return ''
      const s = String(v).replace(/"/g, '""')
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s
    }
    const dateLoc = lang === 'th' ? 'th-TH' : 'en-US'
    const fmtDate = (v: string) => v ? new Date(v).toLocaleDateString(dateLoc) : ''
    const csvRows = [
      headers.join(','),
      ...rows.map(r => [
        r.trackNo, r.orderNo, r.orderDescription, r.supplierName,
        fmtDate(r.orderDate),
        shippingLabels[r.shippingMethod]?.th || r.shippingMethod,
        r.trackingNumber, r.containerNo,
        statusMap[r.status]?.th || r.status,
        fmtDate(r.estimatedDeparture), fmtDate(r.actualDeparture),
        fmtDate(r.estimatedArrival), fmtDate(r.actualArrival),
        customsLabels[r.customsStatus]?.th || r.customsStatus,
        r.customsNotes, r.warehouseLocation, r.serial_number, r.lot_number,
        r.itemsSummary, r.totalValue, r.notes,
        r.thailand_tracking_no, r.thailand_carrier, r.thailand_delivery_status,
        fmtDate(r.thailand_est_delivery), fmtDate(r.thailand_actual_delivery),
        r.thailand_delivery_address, r.thailand_delivery_notes,
        r.created_by, fmtDate(r.created_at)
      ].map(fmt).join(','))
    ]
    const bom = '\uFEFF'
    const blob = new Blob([bom + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `korea-tracking-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const daysUntil = (dateStr: string) => {
    if (!dateStr) return null
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  }

  const getStatusStep = (status: string) => {
    const idx = statusFlow.indexOf(status as any)
    return idx >= 0 ? idx : 0
  }

  const filtered = (filterStatus === 'all' ? records : records.filter(r => r.status === filterStatus))
    .filter(r => !search ||
      r.trackNo.toLowerCase().includes(search.toLowerCase()) ||
      (r.orderDescription || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.orderNo || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.trackingNumber || '').toLowerCase().includes(search.toLowerCase())
    )

  const counts = { total: records.length, ordered: 0, confirmed: 0, manufacturing: 0, shipped: 0, customs: 0, arrived: 0, domestic_shipping: 0, domestic_delivered: 0, delivery_problem: 0, cancelled: 0 }
  records.forEach(r => { if (counts[r.status as keyof typeof counts] !== undefined) (counts as any)[r.status]++ })
  const inTransit = counts.shipped + counts.customs

  const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', transition: 'border-color 0.2s', background: '#fff' }
  const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#374151' }

  return (
    <AdminLayout title="Korea HQ Tracking" titleTh="ติดตามสินค้าเกาหลี">

      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 50%, #f59e0b 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 24, color: '#78350f' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#451a03' }}>
              <img src="https://flagcdn.com/kr.svg" alt="Korea" width={36} height={26} style={{ borderRadius: 4, objectFit: 'cover', verticalAlign: 'middle', marginRight: 10, display: 'inline-block' }} />
              {L('Korea HQ — Goods Receipt & Export Tracking', 'Koreaติดตาม รับเข้า- ส่งออกสินค้า')}
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 14, fontWeight: 600, color: '#78350f' }}>
              {L('Record goods received/exported from Korea & schedule local delivery', 'บันทึกการรับ-ส่งออกสินค้า และกำหนดการจัดส่งในประเทศไทย')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <button onClick={openExport} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 10,
                border: '2px solid rgba(120,53,15,0.3)', background: 'rgba(255,255,255,0.85)',
                color: '#78350f', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,1)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.85)')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {L('Export Goods', 'ส่งสินค้าออก')}
              </button>
              <div style={{ fontSize: 13, color: '#78350f', fontWeight: 600, marginTop: 6, paddingLeft: 2, textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>{L('Transfer / sell to affiliate branch', 'โอน/จำหน่ายสินค้าให้สาขาในเครือ')}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <button onClick={openReceipt} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 10,
                border: '2px solid rgba(120,53,15,0.3)', background: 'rgba(255,255,255,0.85)',
                color: '#78350f', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,1)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.85)')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {L('Record Goods Receipt', 'บันทึกรับสินค้า')}
              </button>
              <div style={{ fontSize: 13, color: '#78350f', fontWeight: 600, marginTop: 6, paddingLeft: 2, textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>{L('Receive at TH branch & update delivery', 'รับสินค้าสาขาไทย & อัพเดตจัดส่ง')}</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12, marginTop: 20 }}>
          {[
            { key: 'total', label: L('Total', 'ทั้งหมด'), count: counts.total, icon: '📋', bg: '#ffffff', border: '#94a3b8' },
            { key: 'ordered', label: L('Ordered', 'สั่งผลิตแล้ว'), count: counts.ordered, icon: '📝', bg: '#fffbeb', border: '#f59e0b' },
            { key: 'manufacturing', label: L('Manufacturing', 'กำลังผลิต'), count: counts.manufacturing, icon: '🏭', bg: '#fff7ed', border: '#f97316' },
            { key: 'inTransit', label: L('In Transit', 'ระหว่างทาง'), count: inTransit, icon: '🚢', bg: '#eff6ff', border: '#3b82f6' },
            { key: 'customs', label: L('Customs', 'ศุลกากร ตรวจรับเข้า'), count: counts.customs, icon: '🛃', bg: '#f5f3ff', border: '#8b5cf6' },
            { key: 'arrived', label: L('Arrived', 'ถึงไทยแล้ว'), count: counts.arrived, icon: '📦', bg: '#ecfdf5', border: '#10b981' },
            { key: 'domestic_shipping', label: L('Domestic Ship', 'กำลังจัดส่งในประเทศ'), count: counts.domestic_shipping, icon: '🚛', bg: '#eff6ff', border: '#2563eb' },
            { key: 'domestic_delivered', label: L('Dom. Delivered', 'จัดส่งในประเทศสำเร็จ'), count: counts.domestic_delivered, icon: '🏠', bg: '#f0fdf4', border: '#16a34a' },
            { key: 'delivery_problem', label: L('Problem', 'เกิดปัญหาการจัดส่ง'), count: counts.delivery_problem, icon: '🔔', bg: '#fef2f2', border: '#ef4444' },
          ].map(s => (
            <div key={s.key} style={{ background: s.bg, border: `3px solid ${s.border}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.border }}>{s.count}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all', ...statusFlow, 'cancelled'] as const).map(s => {
            const active = filterStatus === s
            const st = statusMap[s as string]
            return (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: '7px 14px', borderRadius: 20, border: active ? 'none' : '1px solid #e2e8f0',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                background: active ? (s === 'all' ? '#1e293b' : st?.bg || '#1e293b') : '#fff',
                color: active ? (s === 'all' ? '#fff' : st?.color || '#fff') : '#64748b'
              }}>
                {s === 'all' ? L('All', 'ทั้งหมด') : L(st?.en || s, st?.th || s)}
              </button>
            )
          })}
        </div>
        <div style={{ position: 'relative', minWidth: 220 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={L('Search...', 'ค้นหา...')}
            style={{ ...inp, paddingLeft: 34, borderRadius: 20, fontSize: 13 }} />
        </div>
      </div>

      {/* Records List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#fbbf24', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          {L('Loading...', 'กำลังโหลด...')}
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', background: '#f8fafc', borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>
            <img src="https://flagcdn.com/kr.svg" alt="Korea" width={64} height={48} style={{ borderRadius: 8, objectFit: 'cover', display: 'inline-block' }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{L('No tracking records', 'ไม่พบรายการติดตาม')}</div>
          <div style={{ fontSize: 13 }}>{L('Create your first order tracking', 'สร้างรายการติดตามสินค้าแรก')}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(rec => {
            const st = statusMap[rec.status] || statusMap.ordered
            const isExpanded = expandedID === rec.trackID
            const stepIdx = getStatusStep(rec.status)
            const dl = daysUntil(rec.estimatedArrival)
            return (
              <div key={rec.trackID} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'box-shadow 0.2s', boxShadow: isExpanded ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)' }}>

                {/* Main Row */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 14, cursor: 'pointer', flexWrap: 'wrap' }}
                  onClick={() => setExpandedID(isExpanded ? null : rec.trackID)}>

                  {/* Track No */}
                  <div style={{ minWidth: 110 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#d4940a', letterSpacing: '-0.02em' }}>{rec.trackNo}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {rec.orderDate ? new Date(rec.orderDate).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: '2-digit' }) : ''}
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rec.orderDescription || rec.itemsSummary || '-'}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      {shippingIcons[rec.shippingMethod] || '📦'} {L(shippingLabels[rec.shippingMethod]?.en || rec.shippingMethod, shippingLabels[rec.shippingMethod]?.th || rec.shippingMethod)}
                      {rec.orderNo ? ` • PO: ${rec.orderNo}` : ''}
                    </div>
                  </div>

                  {/* Timeline Progress */}
                  <div style={{ width: 200, minWidth: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {statusFlow.map((s, i) => {
                        const done = i <= stepIdx && rec.status !== 'cancelled'
                        const active = i === stepIdx && rec.status !== 'cancelled'
                        return (
                          <React.Fragment key={s}>
                            <div style={{
                              width: active ? 14 : 10, height: active ? 14 : 10, borderRadius: '50%', flexShrink: 0,
                              background: done ? statusMap[s]?.color || '#f59e0b' : '#e2e8f0',
                              border: active ? '3px solid ' + (statusMap[s]?.bg || '#fef3c7') : 'none',
                              transition: 'all 0.3s'
                            }} title={L(statusMap[s]?.en || s, statusMap[s]?.th || s)} />
                            {i < statusFlow.length - 1 && (
                              <div style={{ flex: 1, height: 3, background: i < stepIdx && rec.status !== 'cancelled' ? '#fbbf24' : '#e2e8f0', borderRadius: 2, transition: 'background 0.3s' }} />
                            )}
                          </React.Fragment>
                        )
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                      <span>{L('Order', 'สั่ง')}</span>
                      <span>{L('Ship', 'ส่ง')}</span>
                      <span>{L('Done', 'สำเร็จ')}</span>
                    </div>
                  </div>

                  {/* ETA */}
                  <div style={{ width: 80, textAlign: 'center' }}>
                    {rec.estimatedArrival ? (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 700, color: dl !== null && dl <= 0 ? '#059669' : dl !== null && dl <= 7 ? '#fbbf24' : '#64748b' }}>
                          {dl !== null ? (dl <= 0 ? L('Arrived', 'ถึงแล้ว') : `${dl} ${L('days', 'วัน')}`) : '-'}
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                          {new Date(rec.estimatedArrival).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short' })}
                        </div>
                      </>
                    ) : <span style={{ fontSize: 12, color: '#cbd5e1' }}>-</span>}
                  </div>

                  {/* Status */}
                  <span style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: st.bg, color: st.color, whiteSpace: 'nowrap'
                  }}>
                    {L(st.en, st.th)}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(rec)} title={L('Edit', 'แก้ไข')} style={{
                      width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(rec.trackID)} title={L('Delete', 'ลบ')} style={{
                      width: 34, height: 34, borderRadius: 8, border: '1px solid #fecaca', background: '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>

                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
                    style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #f1f5f9', background: '#fafbfc', padding: '20px 24px' }}>
                    {/* Full Timeline */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 20, overflowX: 'auto', padding: '0 8px' }}>
                      {statusFlow.map((s, i) => {
                        const done = i <= stepIdx && rec.status !== 'cancelled'
                        const active = i === stepIdx && rec.status !== 'cancelled'
                        const sm = statusMap[s]
                        return (
                          <React.Fragment key={s}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 70, position: 'relative' }}>
                              <div style={{
                                width: active ? 32 : 24, height: active ? 32 : 24, borderRadius: '50%', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: active ? 16 : 12,
                                background: done ? sm?.color || '#f59e0b' : '#e2e8f0', color: done ? '#fff' : '#94a3b8',
                                border: active ? `3px solid ${sm?.bg || '#fef3c7'}` : 'none', fontWeight: 700,
                                boxShadow: active ? `0 0 0 4px ${sm?.bg || '#fef3c7'}` : 'none', transition: 'all 0.3s'
                              }}>
                                {done ? '✓' : i + 1}
                              </div>
                              <div style={{ fontSize: 10, fontWeight: 600, marginTop: 6, color: done ? sm?.color : '#94a3b8', textAlign: 'center', lineHeight: 1.2 }}>
                                {L(sm?.en || s, sm?.th || s)}
                              </div>
                            </div>
                            {i < statusFlow.length - 1 && (
                              <div style={{ flex: 1, height: 3, background: i < stepIdx && rec.status !== 'cancelled' ? '#fbbf24' : '#e2e8f0', borderRadius: 2, marginTop: active ? 15 : 11, minWidth: 20 }} />
                            )}
                          </React.Fragment>
                        )
                      })}
                    </div>

                    {/* Korea to Thailand Shipping */}
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 18 }}>🇰🇷→🇹🇭</span> {L('Korea to Thailand Shipping', 'การจัดส่งจากเกาหลีมาไทย')}
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                        {[
                          { icon: '📦', label: L('Items', 'รายการสินค้า'), value: rec.itemsSummary },
                          { icon: '💰', label: L('Total Value', 'มูลค่ารวม'), value: rec.totalValue ? `${Number(rec.totalValue).toLocaleString()} ${L('THB', 'บาท')}` : null },
                          { icon: '🏢', label: L('Supplier', 'ผู้จัดส่ง'), value: rec.supplierName },
                          { icon: '🚢', label: L('Tracking No.', 'เลขพัสดุ'), value: rec.trackingNumber },
                          { icon: '📋', label: L('Container/AWB', 'เลขตู้/AWB'), value: rec.containerNo },
                          { icon: '📅', label: L('Est. Departure', 'กำหนดออก'), value: rec.estimatedDeparture ? new Date(rec.estimatedDeparture).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US') : null },
                          { icon: '🛬', label: L('Est. Arrival', 'กำหนดถึง'), value: rec.estimatedArrival ? new Date(rec.estimatedArrival).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US') : null },
                          { icon: '✅', label: L('Actual Arrival', 'ถึงจริง'), value: rec.actualArrival ? new Date(rec.actualArrival).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US') : null },
                          { icon: '🛃', label: L('Customs', 'ศุลกากร'), value: customsLabels[rec.customsStatus] ? L(customsLabels[rec.customsStatus].en, customsLabels[rec.customsStatus].th) : null },
                          { icon: '🏪', label: L('Warehouse', 'คลังสินค้า'), value: rec.warehouseLocation },
                          { icon: '🔢', label: L('Serial No.', 'เลขเครื่อง'), value: rec.serial_number },
                          { icon: '🏷️', label: L('Lot No.', 'เลข Lot'), value: rec.lot_number },
                          { icon: '📝', label: L('Notes', 'หมายเหตุ'), value: rec.notes },
                        ].filter(d => d.value).map((d, i) => (
                          <div key={i}>
                            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{d.icon} {d.label}</div>
                            <div style={{ fontSize: 14, color: '#334155', whiteSpace: 'pre-line' }}>{d.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Thailand Local Delivery */}
                    {(rec.thailand_tracking_no || rec.thailand_carrier || rec.thailand_delivery_address) && (
                      <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: 20 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 18 }}>🚚</span> {L('Thailand Local Delivery', 'การจัดส่งในไทย')}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                          {[
                            { icon: '📦', label: L('Thailand Tracking', 'เลขพัสดุไทย'), value: rec.thailand_tracking_no },
                            { icon: '🚚', label: L('Carrier', 'บริษัทขนส่ง'), value: rec.thailand_carrier },
                            { icon: '📍', label: L('Delivery Status', 'สถานะจัดส่ง'), value: rec.thailand_delivery_status ? L(
                              rec.thailand_delivery_status === 'pending' ? 'Pending' :
                              rec.thailand_delivery_status === 'preparing' ? 'Preparing' :
                              rec.thailand_delivery_status === 'in_transit' ? 'In Transit' :
                              rec.thailand_delivery_status === 'out_for_delivery' ? 'Out for Delivery' :
                              rec.thailand_delivery_status === 'delivered' ? 'Delivered' :
                              rec.thailand_delivery_status === 'failed' ? 'Failed' : rec.thailand_delivery_status,
                              rec.thailand_delivery_status === 'pending' ? 'รอดำเนินการ' :
                              rec.thailand_delivery_status === 'preparing' ? 'กำลังเตรียม' :
                              rec.thailand_delivery_status === 'in_transit' ? 'ระหว่างจัดส่ง' :
                              rec.thailand_delivery_status === 'out_for_delivery' ? 'ออกจัดส่งแล้ว' :
                              rec.thailand_delivery_status === 'delivered' ? 'จัดส่งสำเร็จ' :
                              rec.thailand_delivery_status === 'failed' ? 'จัดส่งไม่สำเร็จ' : rec.thailand_delivery_status
                            ) : null },
                            { icon: '📅', label: L('Est. Delivery', 'กำหนดส่ง'), value: rec.thailand_est_delivery ? new Date(rec.thailand_est_delivery).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US') : null },
                            { icon: '✅', label: L('Actual Delivery', 'ส่งสำเร็จ'), value: rec.thailand_actual_delivery ? new Date(rec.thailand_actual_delivery).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US') : null },
                            { icon: '🏠', label: L('Delivery Address', 'ที่อยู่จัดส่ง'), value: rec.thailand_delivery_address },
                            { icon: '📝', label: L('Delivery Notes', 'หมายเหตุ'), value: rec.thailand_delivery_notes },
                          ].filter(d => d.value).map((d, i) => (
                            <div key={i}>
                              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{d.icon} {d.label}</div>
                              <div style={{ fontSize: 14, color: '#334155', whiteSpace: 'pre-line' }}>{d.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ====== Form Modal ====== */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
          <div lang={lang === 'th' ? 'th' : 'en'} style={{ background: '#fff', borderRadius: 16, maxWidth: 800, width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>

            {/* Modal Header */}
            <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1e293b' }}>
                  <img src="https://flagcdn.com/kr.svg" alt="Korea" width={28} height={20} style={{ borderRadius: 3, objectFit: 'cover', verticalAlign: 'middle', marginRight: 8, display: 'inline-block' }} />
                  {editID ? L('Edit Record', 'แก้ไขรายการ') : formMode === 'export' ? L('Transfer / Sell to Affiliate Branch', 'บันทึกโอน/จำหน่ายสินค้าให้สาขา') : L('Receive Goods at TH Branch & Update Delivery', 'บันทึกรับสินค้าสาขาไทย & อัพเดตจัดส่ง')}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>
                  {formMode === 'export' ? L('Record transfer or sale of goods to another branch in the affiliate network', 'บันทึกการโอนสินค้าหรือจำหน่ายให้สาขาอื่นในบริษัทในเครือ') : L('Record goods received at Thailand branch and update domestic delivery status', 'บันทึกรับสินค้าถึงสาขาประเทศไทย และอัพเดตสถานะการจัดส่งภายในประเทศ')}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ padding: '20px 28px 28px' }}>

              {/* Link PDO (optional) */}
              <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #fcd34d' }}>
                <label style={{ ...lbl, color: '#92400e', fontSize: 14, marginBottom: 12 }}>
                  📋 {L('Link to Transfer & Sales Order', 'เชื่อมกับใบโอนสินค้า และ ใบสั่งขาย')}
                </label>

                  {/* PDO Column */}
                  <div>
                    <label style={{ ...lbl, fontSize: 12, color: '#92400e' }}>📦 {L('Search SO No.', 'ค้นหาเลข SO')}</label>
                    <div style={{ position: 'relative', marginBottom: 6 }}>
                      <input value={pdoSearch} onChange={e => setPdoSearch(e.target.value)}
                        placeholder={L('Search ST...', 'ค้นหาเลข ST...')}
                        style={{ ...inp, borderColor: '#fcd34d', fontSize: 13 }} />
                    </div>
                    {pdoSearch && (
                      <div style={{ maxHeight: 140, overflowY: 'auto', borderRadius: 8, border: '1px solid #fcd34d', background: '#fff', marginBottom: 4 }}>
                        {pdos.filter(p =>
                          p.pdoNo.toLowerCase().includes(pdoSearch.toLowerCase()) ||
                          (p.product_name || '').toLowerCase().includes(pdoSearch.toLowerCase()) ||
                          (p.product_code || '').toLowerCase().includes(pdoSearch.toLowerCase())
                        ).slice(0, 30).map(p => (
                          <div key={p.pdoID} onClick={() => handlePDOSelect(p)}
                            style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #fef3c7', fontSize: 12 }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fffbeb'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                            <span style={{ fontWeight: 700, color: '#d4940a' }}>{p.pdoNo}</span>
                            <span style={{ marginLeft: 6, color: '#64748b' }}>{p.product_name}</span>
                            <span style={{ float: 'right', color: '#475569', fontSize: 11 }}>{p.quantity_ordered} {p.unit}</span>
                          </div>
                        ))}
                        {pdos.filter(p =>
                          p.pdoNo.toLowerCase().includes(pdoSearch.toLowerCase()) ||
                          (p.product_name || '').toLowerCase().includes(pdoSearch.toLowerCase()) ||
                          (p.product_code || '').toLowerCase().includes(pdoSearch.toLowerCase())
                        ).length === 0 && (
                          <div style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>{L('No results', 'ไม่พบรายการ')}</div>
                        )}
                      </div>
                    )}
                    {form.pdoNo && (
                      <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, background: '#fff', borderRadius: 6, padding: '4px 10px', border: '1px solid #fcd34d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>✓ {form.pdoNo}</span>
                        <button onClick={() => setForm(f => ({ ...f, pdo_id: '', pdoNo: '' }))}
                          style={{ padding: '1px 8px', borderRadius: 5, border: '1px solid #fcd34d', background: 'transparent', cursor: 'pointer', fontSize: 11, color: '#d4940a' }}>
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

              </div>

              {/* Goods Info / Transfer Info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: formMode === 'export' ? '#ede9fe' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{formMode === 'export' ? '🔀' : '📦'}</span>
                  {formMode === 'export' ? L('Transfer / Sales Information', 'ข้อมูลการโอน/จำหน่ายสินค้า') : L('Goods Receipt Information', 'ข้อมูลการรับสินค้า')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {formMode === 'export' && (
                    <div style={{ gridColumn: '1 / -1', background: '#faf5ff', borderRadius: 10, padding: '12px 14px', border: '1px solid #e9d5ff' }}>
                      <label style={{ ...lbl, color: '#7c3aed' }}>{L('Destination Branch / Recipient Company', 'สาขาปลายทาง / บริษัทผู้รับ')} <span style={{ color: '#ef4444' }}>*</span></label>
                      <input value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} style={{ ...inp, borderColor: '#c4b5fd' }}
                        placeholder={L('e.g. Thailand Branch, Vietnam Branch, Affiliate Co., Ltd.', 'เช่น สาขาไทย, สาขาเวียดนาม, บริษัทในเครือ จำกัด')} />
                    </div>
                  )}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>{L('Goods Description', 'รายละเอียดสินค้า')} <span style={{ color: '#ef4444' }}>*</span></label>
                    <textarea value={form.orderDescription} onChange={e => setForm(f => ({ ...f, orderDescription: e.target.value }))} style={{ ...inp, minHeight: 60, resize: 'vertical' }}
                      placeholder={formMode === 'export' ? L('Goods being transferred/sold to affiliate branch', 'รายละเอียดสินค้าที่โอน/จำหน่ายให้สาขา') : L('Description of goods received from Korea HQ', 'รายละเอียดสินค้าที่รับจากเกาหลี')} />
                  </div>
                  {formMode === 'receipt' && <div>
                    <label style={lbl}>{L('Supplier', 'ผู้จัดส่ง')}</label>
                    <input value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} style={inp} />
                  </div>}
                  <div>
                    <label style={lbl}>{L('Order Date', 'วันที่สั่ง')}</label>
                    <input type="date" value={form.orderDate} onChange={e => setForm(f => ({ ...f, orderDate: e.target.value }))} style={inp} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>{L('Items Summary', 'สรุปรายการสินค้า')}</label>
                    <textarea value={form.itemsSummary} onChange={e => setForm(f => ({ ...f, itemsSummary: e.target.value }))} style={{ ...inp, minHeight: 50, resize: 'vertical' }} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Total Value (THB)', 'มูลค่ารวม (บาท)')}</label>
                    <input type="number" value={form.totalValue} onChange={e => setForm(f => ({ ...f, totalValue: e.target.value }))} style={inp} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={lbl}>{L('Status', 'สถานะ')}</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inp}>
                      {[...statusFlow, 'cancelled'].map(s => {
                        const sm = statusMap[s]
                        return <option key={s} value={s}>{L(sm?.en || s, sm?.th || s)}</option>
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Identification - only for Receipt mode */}
              {formMode === 'receipt' && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔖</span>
                  {L('Product Identification', 'ข้อมูลระบุสินค้า')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>{L('Serial Number', 'เลขเครื่อง')}</label>
                    <input value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} style={inp}
                      placeholder={L('Enter serial number', 'กรอกเลขเครื่อง')} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Lot Number', 'เลข Lot')}</label>
                    <input value={form.lot_number} onChange={e => setForm(f => ({ ...f, lot_number: e.target.value }))} style={inp}
                      placeholder={L('Enter lot number', 'กรอกเลข Lot')} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <button type="button" onClick={() => setShowScanner(v => !v)} style={{
                      padding: '10px 20px', fontSize: 14, fontWeight: 600, border: '1px solid #6366f1',
                      borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                      background: showScanner ? '#6366f1' : '#fff', color: showScanner ? '#fff' : '#6366f1',
                      transition: 'all 0.2s'
                    }}>
                      <span style={{ fontSize: 18 }}>📷</span>
                      {showScanner ? L('Close Scanner', 'ปิดสแกนเนอร์') : L('Scan QR Code', 'สแกน QR Code')}
                    </button>
                    {showScanner && (
                      <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '2px solid #6366f1', position: 'relative' }}>
                        <div ref={scannerRef} id="qr-scanner-region" style={{ width: '100%' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )}

              {/* Shipping */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🚢</span>
                  {L('Shipping Details', 'ข้อมูลการจัดส่ง')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>{L('Shipping Method', 'วิธีจัดส่ง')}</label>
                    <select value={form.shippingMethod} onChange={e => setForm(f => ({ ...f, shippingMethod: e.target.value }))} style={inp}>
                      {Object.entries(shippingLabels).map(([k, v]) => (
                        <option key={k} value={k}>{shippingIcons[k]} {L(v.en, v.th)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>{L('Tracking Number', 'เลขพัสดุ')}</label>
                    <input value={form.trackingNumber} onChange={e => setForm(f => ({ ...f, trackingNumber: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Container / AWB No.', 'เลขตู้คอนเทนเนอร์ / AWB')}</label>
                    <input value={form.containerNo} onChange={e => setForm(f => ({ ...f, containerNo: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Est. Departure', 'กำหนดออกจากเกาหลี')}</label>
                    <input type="date" value={form.estimatedDeparture} onChange={e => setForm(f => ({ ...f, estimatedDeparture: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Actual Departure', 'ออกจริง')}</label>
                    <input type="date" value={form.actualDeparture} onChange={e => setForm(f => ({ ...f, actualDeparture: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Est. Arrival (Thailand)', 'กำหนดถึงไทย')}</label>
                    <input type="date" value={form.estimatedArrival} onChange={e => setForm(f => ({ ...f, estimatedArrival: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Actual Arrival', 'ถึงจริง')}</label>
                    <input type="date" value={form.actualArrival} onChange={e => setForm(f => ({ ...f, actualArrival: e.target.value }))} style={inp} />
                  </div>
                </div>
              </div>

              {/* Customs & Warehouse */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🛃</span>
                  {L('Customs & Warehouse', 'ศุลกากรและคลังสินค้า')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>{L('Customs Status', 'สถานะศุลกากร')}</label>
                    <select value={form.customsStatus} onChange={e => setForm(f => ({ ...f, customsStatus: e.target.value }))} style={inp}>
                      {Object.entries(customsLabels).map(([k, v]) => (
                        <option key={k} value={k}>{L(v.en, v.th)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>{L('Warehouse Location', 'สถานที่คลังสินค้า')}</label>
                    <input value={form.warehouseLocation} onChange={e => setForm(f => ({ ...f, warehouseLocation: e.target.value }))} style={inp} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>{L('Customs Notes', 'หมายเหตุศุลกากร')}</label>
                    <textarea value={form.customsNotes} onChange={e => setForm(f => ({ ...f, customsNotes: e.target.value }))} style={{ ...inp, minHeight: 50, resize: 'vertical' }} />
                  </div>
                </div>
              </div>

              {/* Thailand Local Delivery - only for Receipt mode */}
              {formMode === 'receipt' && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🚚</span>
                  {L('Thailand Local Delivery', 'การจัดส่งในไทย')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>{L('Thailand Tracking No.', 'เลขพัสดุในไทย')}</label>
                    <input value={form.thailand_tracking_no} onChange={e => setForm(f => ({ ...f, thailand_tracking_no: e.target.value }))} style={inp} placeholder="THXXX123456" />
                  </div>
                  <div>
                    <label style={lbl}>{L('Delivery Carrier', 'บริษัทขนส่ง')} <span style={{ color: '#ef4444' }}>*</span></label>
                    <select value={form.thailand_carrier} onChange={e => setForm(f => ({ ...f, thailand_carrier: e.target.value }))} style={inp}>
                      <option value="">{L('Select carrier', 'เลือกบริษัทขนส่ง')}</option>
                      <option value="Kerry Express">Kerry Express</option>
                      <option value="Flash Express">Flash Express</option>
                      <option value="J&T Express">J&T Express</option>
                      <option value="SCG Express">SCG Express</option>
                      <option value="Thailand Post">Thailand Post (ไปรษณีย์ไทย)</option>
                      <option value="Ninja Van">Ninja Van</option>
                      <option value="Best Express">Best Express</option>
                      <option value="DHL">DHL</option>
                      <option value="FedEx">FedEx</option>
                      <option value="Own Delivery">Own Delivery (จัดส่งเอง)</option>
                      <option value="Other">Other (อื่นๆ)</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>{L('Delivery Status', 'สถานะการจัดส่ง')}</label>
                    <select value={form.thailand_delivery_status} onChange={e => setForm(f => ({ ...f, thailand_delivery_status: e.target.value }))} style={inp}>
                      <option value="pending">{L('Pending', 'รอดำเนินการ')}</option>
                      <option value="preparing">{L('Preparing', 'กำลังเตรียมสินค้า')}</option>
                      <option value="in_transit">{L('In Transit', 'ระหว่างจัดส่ง')}</option>
                      <option value="out_for_delivery">{L('Out for Delivery', 'ออกจัดส่งแล้ว')}</option>
                      <option value="delivered">{L('Delivered', 'จัดส่งสำเร็จ')}</option>
                      <option value="failed">{L('Failed', 'จัดส่งไม่สำเร็จ')}</option>
                      <option value="returned">{L('Returned', 'ส่งคืน')}</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>{L('Est. Delivery Date', 'วันที่กำหนดส่ง')}</label>
                    <input type="date" value={form.thailand_est_delivery} onChange={e => setForm(f => ({ ...f, thailand_est_delivery: e.target.value }))} style={inp} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>{L('Actual Delivery Date', 'วันที่ส่งสำเร็จจริง')}</label>
                    <input type="date" value={form.thailand_actual_delivery} onChange={e => setForm(f => ({ ...f, thailand_actual_delivery: e.target.value }))} style={inp} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>{L('Delivery Address', 'ที่อยู่จัดส่ง')} <span style={{ color: '#ef4444' }}>*</span></label>
                    <textarea value={form.thailand_delivery_address} onChange={e => setForm(f => ({ ...f, thailand_delivery_address: e.target.value }))}
                      style={{ ...inp, minHeight: 70, resize: 'vertical' }}
                      placeholder={L('Customer delivery address in Thailand (Required)', 'ที่อยู่จัดส่งของลูกค้าในไทย (จำเป็น)')} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>{L('Delivery Notes', 'หมายเหตุการจัดส่ง')}</label>
                    <textarea value={form.thailand_delivery_notes} onChange={e => setForm(f => ({ ...f, thailand_delivery_notes: e.target.value }))}
                      style={{ ...inp, minHeight: 50, resize: 'vertical' }}
                      placeholder={L('Special instructions, delivery issues, etc.', 'คำแนะนำพิเศษ, ปัญหาการจัดส่ง ฯลฯ')} />
                  </div>
                </div>
              </div>
              )}

              {/* Notes */}
              <div style={{ marginBottom: 24 }}>
                <label style={lbl}>{L('General Notes', 'หมายเหตุทั่วไป')}</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inp, minHeight: 60, resize: 'vertical' }} />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                <button onClick={() => setShowForm(false)} style={{ padding: '11px 28px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#475569' }}>
                  {L('Cancel', 'ยกเลิก')}
                </button>
                <button onClick={handleSave} disabled={saving} style={{
                  padding: '11px 28px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: 14, color: '#fff',
                  background: saving ? '#94a3b8' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  boxShadow: saving ? 'none' : '0 4px 12px rgba(251,191,36,0.4)'
                }}>
                  {saving ? L('Saving...', 'กำลังบันทึก...') : editID ? L('Update', 'อัปเดต') : formMode === 'export' ? L('Record Transfer / Sale', 'บันทึกโอน/จำหน่ายสินค้า') : L('Record Receipt & Update Delivery', 'บันทึกรับสินค้า & อัพเดตจัดส่ง')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
