"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import AccWindow, { useLang } from '../../components/AccWindow'

type Bill = {
  id?: number; doc_no?: string; scan_date?: string; bill_date?: string
  vendor_name?: string; tax_id?: string; subtotal?: number; vat?: number; total?: number
  category?: string; ocr_text?: string; image_path?: string
  status?: string; note?: string
}
const emptyBill: Bill = { bill_date: '', vendor_name: '', tax_id: '', subtotal: 0, vat: 0, total: 0, category: 'expense', status: 'draft', note: '' }

const th: React.CSSProperties = { padding: '8px 14px', background: '#4b5563', color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '7px 14px', borderBottom: '1px solid #e5e7eb', fontSize: 13.5 }
const inp: React.CSSProperties = { width: '100%', padding: '3px 6px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, boxSizing: 'border-box' }
const btn = (bg: string, c = '#1f2937'): React.CSSProperties => ({ padding: '7px 18px', background: bg === '#f3f4f6' ? '#f3f4f6' : bg, color: c, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: '"Sarabun","Tahoma",sans-serif', transition: 'all 0.2s' })
const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function ScanBillPage() {
  const { L } = useLang()
  const [data, setData] = useState<Bill[]>([])
  const [form, setForm] = useState<Bill>(emptyBill)
  const [showScan, setShowScan] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showImage, setShowImage] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [ocrProgress, setOcrProgress] = useState('')
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [tab, setTab] = useState<'upload' | 'camera'>('upload')
  const [ocrRaw, setOcrRaw] = useState('')
  const [showOcr, setShowOcr] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const r = await fetch('/api/accounting/scan-bill' + (search ? '?q=' + encodeURIComponent(search) : ''))
    const d = await r.json()
    if (d.ok) setData(d.data)
  }, [search])

  useEffect(() => { load() }, [load])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch {
      setMsg(L('Camera access denied', 'ไม่สามารถเข้าถึงกล้อง'))
    }
  }, [L])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setPreview(dataUrl)
    stopCamera()
  }, [stopCamera])

  const uploadAndOcr = useCallback(async (file: File | Blob, name?: string) => {
    setLoading(true)
    setOcrProgress(L('Uploading & scanning...', 'กำลังอัปโหลดและสแกน...'))
    setMsg('')
    const fd = new FormData()
    fd.append('file', file, name || 'scan.jpg')
    try {
      const r = await fetch('/api/accounting/scan-bill', { method: 'POST', body: fd })
      const d = await r.json()
      if (d.ok) {
        setForm(d.data)
        setOcrRaw(d.data.ocr_text || '')
        setOcrProgress('')
        setShowScan(false)
        setShowEdit(true)
        setPreview(null)
        load()
        setMsg(L('Scan complete! Review the extracted data.', 'สแกนสำเร็จ! ตรวจสอบข้อมูลที่แยกได้'))
      } else {
        setMsg('Error: ' + d.error)
        setOcrProgress('')
      }
    } catch (e: unknown) {
      setMsg('Error: ' + (e instanceof Error ? e.message : 'Unknown error'))
      setOcrProgress('')
    }
    setLoading(false)
  }, [L, load])

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const doUpload = useCallback(async () => {
    if (!preview) return
    // Convert dataURL to blob
    const res = await fetch(preview)
    const blob = await res.blob()
    await uploadAndOcr(blob, 'scan.' + (blob.type.includes('png') ? 'png' : 'jpg'))
  }, [preview, uploadAndOcr])

  const saveEdit = useCallback(async () => {
    setLoading(true); setMsg('')
    const r = await fetch('/api/accounting/scan-bill', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await r.json()
    if (d.ok) { setShowEdit(false); load(); setMsg(L('Saved', 'บันทึกสำเร็จ')) }
    else setMsg('Error: ' + d.error)
    setLoading(false)
  }, [form, L, load])

  const del = useCallback(async (id: number) => {
    if (!confirm(L('Delete this scanned bill?', 'ลบบิลที่สแกนนี้?'))) return
    await fetch('/api/accounting/scan-bill?id=' + id, { method: 'DELETE' })
    load()
  }, [L, load])
  const handleDelete = useCallback((id?: number) => {
    if (typeof id === 'number') {
      void del(id)
    }
  }, [del])

  const openScan = useCallback(() => {
    setPreview(null)
    setTab('upload')
    setShowScan(true)
    setOcrProgress('')
  }, [])

  const closeScan = useCallback(() => {
    stopCamera()
    setShowScan(false)
    setPreview(null)
  }, [stopCamera])

  useEffect(() => {
    if (showScan && tab === 'camera') startCamera()
    else stopCamera()
  }, [showScan, tab, startCamera, stopCamera])

  // Cleanup camera on unmount
  useEffect(() => () => stopCamera(), [stopCamera])

  return (
    <AccWindow title={L('Scan Bill', 'สแกนบิลเข้าระบบ')}>
      <div style={{ padding: 12 }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button style={btn('#f3f4f6')} onClick={openScan}>+ {L('Scan Bill', 'สแกนบิล')}</button>
          <input style={{ ...inp, width: 200 }} placeholder={L('Search...', 'ค้นหา...')} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
          <button style={btn('#f3f4f6')} onClick={load}>{L('Search', 'ค้นหา')}</button>
          {msg && <span style={{ color: msg.startsWith('E') ? 'red' : 'green', fontSize: 13 }}>{msg}</span>}
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto', border: '1px solid #d1d5db', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {[L('Doc No', 'เลขที่'), L('Scan Date', 'วันที่สแกน'), L('Bill Date', 'วันที่บิล'), L('Vendor', 'ผู้จำหน่าย'), L('Total', 'ยอดรวม'), L('Status', 'สถานะ'), ''].map((h, i) =>
                <th key={i} style={th}>{h}</th>
              )}
            </tr></thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: '#888', padding: 20 }}>{L('No data', 'ไม่มีข้อมูล')}</td></tr>}
              {data.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 ? '#f5f5f5' : '#fff' }}>
                  <td style={td}>{r.doc_no}</td>
                  <td style={td}>{r.scan_date?.slice(0, 10)}</td>
                  <td style={td}>{r.bill_date?.slice(0, 10) || '-'}</td>
                  <td style={td}>{r.vendor_name || '-'}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmt(r.total || 0)}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <span style={{ color: r.status === 'posted' ? 'green' : r.status === 'verified' ? '#0066cc' : '#888' }}>
                      {r.status === 'posted' ? L('Posted', 'ผ่านรายการ') : r.status === 'verified' ? L('Verified', 'ตรวจแล้ว') : L('Draft', 'ร่าง')}
                    </span>
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <button style={{ ...btn('#f3f4f6'), marginRight: 3 }} onClick={() => setShowImage(r.id ?? null)}>
                      {L('View', 'ดูบิล')}
                    </button>
                    <button style={{ ...btn('#f3f4f6'), marginRight: 3 }} onClick={() => { setForm({ ...r }); setOcrRaw(r.ocr_text || ''); setShowEdit(true) }}>
                      {L('Edit', 'แก้ไข')}
                    </button>
                    <button style={btn('#f3f4f6', '#dc2626')} onClick={() => handleDelete(r.id)}>{L('Del', 'ลบ')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* === Scan Modal === */}
        {showScan && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', minWidth: 480, maxWidth: 640, width: '95%' }}>
              <div style={{ background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)', padding: '3px 8px', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                <span>{L('Scan Bill / Receipt', 'สแกนบิล / ใบเสร็จ')}</span>
                <span style={{ cursor: 'pointer' }} onClick={closeScan}>X</span>
              </div>
              <div style={{ padding: 12 }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 0, marginBottom: 10 }}>
                  <button style={{ ...btn(tab === 'upload' ? '#fff' : '#f3f4f6'), borderBottom: tab === 'upload' ? '2px solid #fff' : undefined }} onClick={() => setTab('upload')}>
                    {L('Upload File', 'อัปโหลดไฟล์')}
                  </button>
                  <button style={{ ...btn(tab === 'camera' ? '#fff' : '#f3f4f6'), borderBottom: tab === 'camera' ? '2px solid #fff' : undefined }} onClick={() => setTab('camera')}>
                    {L('Camera', 'ถ่ายภาพ')}
                  </button>
                </div>

                {/* Upload tab */}
                {tab === 'upload' && !preview && (
                  <div style={{ border: '2px dashed #9ca3af', padding: 30, textAlign: 'center', cursor: 'pointer', background: '#f5f5f5' }}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { const r = new FileReader(); r.onload = () => setPreview(r.result as string); r.readAsDataURL(f) } }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 8 }}>+</div>
                    <div style={{ fontSize: 13, color: '#444' }}>
                      {L('Click to select file or drag & drop', 'คลิกเลือกไฟล์หรือลากไฟล์มาวาง')}
                    </div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>JPG, PNG, PDF</div>
                    <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFile} />
                  </div>
                )}

                {/* Camera tab */}
                {tab === 'camera' && !preview && (
                  <div>
                    <video ref={videoRef} style={{ width: '100%', maxHeight: 320, background: '#000', border: '1px solid #d1d5db', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }} autoPlay playsInline muted />
                    <div style={{ marginTop: 6, textAlign: 'center' }}>
                      <button style={btn('#f3f4f6')} onClick={capturePhoto}>{L('Capture', 'ถ่ายภาพ')}</button>
                    </div>
                  </div>
                )}

                {/* Preview */}
                {preview && (
                  <div>
                    <Image src={preview} alt="preview" width={1200} height={900} unoptimized style={{ width: '100%', height: 'auto', maxHeight: 300, objectFit: 'contain', border: '1px solid #d1d5db', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', background: '#fff' }} />
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button style={btn('#f3f4f6')} onClick={() => setPreview(null)}>{L('Retake', 'ถ่ายใหม่')}</button>
                      <button style={btn('#f3f4f6', '#4b5563')} disabled={loading} onClick={doUpload}>
                        {loading ? ocrProgress || '...' : L('Scan & Extract', 'สแกนและแยกข้อมูล')}
                      </button>
                    </div>
                  </div>
                )}

                {ocrProgress && (
                  <div style={{ marginTop: 8, padding: 8, background: '#ffffcc', border: '1px solid #cca', fontSize: 13, textAlign: 'center' }}>
                    {ocrProgress}
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          </div>
        )}

        {/* === Edit/Review Modal === */}
        {showEdit && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', minWidth: 520, maxWidth: 680, width: '95%', maxHeight: '90vh', overflow: 'auto' }}>
              <div style={{ background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)', padding: '3px 8px', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1 }}>
                <span>{form.id ? L('Edit Scanned Bill', 'แก้ไขบิลที่สแกน') : L('Review Scan Result', 'ตรวจสอบผลสแกน')}</span>
                <span style={{ cursor: 'pointer' }} onClick={() => setShowEdit(false)}>X</span>
              </div>
              <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                {form.doc_no && (
                  <div style={{ gridColumn: 'span 2', fontSize: 13, color: '#4b5563', fontWeight: 700, marginBottom: 4 }}>
                    {L('Doc No', 'เลขที่')}: {form.doc_no}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>{L('Bill Date', 'วันที่บิล')}</div>
                  <input style={inp} type="date" value={form.bill_date || ''} onChange={e => setForm(f => ({ ...f, bill_date: e.target.value }))} />
                </div>
                <div>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>{L('Category', 'หมวดหมู่')}</div>
                  <select style={inp} value={form.category || 'expense'} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="expense">{L('Expense', 'ค่าใช้จ่าย')}</option>
                    <option value="purchase">{L('Purchase', 'ซื้อสินค้า')}</option>
                    <option value="receipt">{L('Receipt', 'ใบเสร็จรับเงิน')}</option>
                    <option value="invoice">{L('Invoice', 'ใบแจ้งหนี้')}</option>
                    <option value="other">{L('Other', 'อื่นๆ')}</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>{L('Vendor Name', 'ชื่อผู้จำหน่าย')}</div>
                  <input style={inp} value={form.vendor_name || ''} onChange={e => setForm(f => ({ ...f, vendor_name: e.target.value }))} />
                </div>
                <div>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>{L('Tax ID', 'เลขที่ผู้เสียภาษี')}</div>
                  <input style={inp} value={form.tax_id || ''} onChange={e => setForm(f => ({ ...f, tax_id: e.target.value }))} />
                </div>
                <div>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>{L('Status', 'สถานะ')}</div>
                  <select style={inp} value={form.status || 'draft'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="draft">{L('Draft', 'ร่าง')}</option>
                    <option value="verified">{L('Verified', 'ตรวจแล้ว')}</option>
                    <option value="posted">{L('Posted', 'ผ่านรายการ')}</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>{L('Subtotal', 'ราคาก่อน VAT')}</div>
                  <input style={inp} type="number" value={form.subtotal || ''} onChange={e => {
                    const sub = +e.target.value || 0
                    const vat = Math.round(sub * 7) / 100
                    setForm(f => ({ ...f, subtotal: sub, vat, total: Math.round((sub + vat) * 100) / 100 }))
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>{L('VAT 7%', 'VAT 7%')}</div>
                  <input style={inp} readOnly value={fmt(form.vat || 0)} />
                </div>
                <div>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>{L('Total', 'ยอดรวม')}</div>
                  <input style={{ ...inp, fontWeight: 700 }} readOnly value={fmt(form.total || 0)} />
                </div>
                <div>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>&nbsp;</div>
                  {form.id && (
                    <button style={{ ...btn('#f3f4f6'), fontSize: 12 }} onClick={() => setShowImage(form.id!)}>
                      {L('View Image', 'ดูรูปบิล')}
                    </button>
                  )}
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>{L('Note', 'หมายเหตุ')}</div>
                  <textarea style={{ ...inp, height: 50, resize: 'vertical' }} value={form.note || ''} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
                </div>

                {/* OCR Raw Text */}
                {ocrRaw && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: 12, marginBottom: 2, cursor: 'pointer', color: '#4b5563', textDecoration: 'underline' }} onClick={() => setShowOcr(!showOcr)}>
                      {showOcr ? L('Hide OCR Text', 'ซ่อนข้อความ OCR') : L('Show OCR Text', 'แสดงข้อความ OCR')} ({ocrRaw.length} {L('chars', 'ตัวอักษร')})
                    </div>
                    {showOcr && (
                      <textarea style={{ ...inp, height: 120, resize: 'vertical', fontSize: 11, color: '#555', fontFamily: 'monospace' }} readOnly value={ocrRaw} />
                    )}
                  </div>
                )}
              </div>
              <div style={{ padding: '8px 16px 12px', display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid #999' }}>
                <button style={btn('#f3f4f6')} onClick={() => setShowEdit(false)}>{L('Cancel', 'ยกเลิก')}</button>
                <button style={btn('#f3f4f6', '#4b5563')} disabled={loading} onClick={saveEdit}>
                  {loading ? '...' : L('Save', 'บันทึก')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === Image Viewer Modal === */}
        {showImage !== null && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowImage(null)}>
            <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
              <div style={{ background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)', padding: '3px 8px', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                <span>{L('Bill Image', 'รูปบิล')}</span>
                <span style={{ cursor: 'pointer' }} onClick={() => setShowImage(null)}>X</span>
              </div>
              <div style={{ padding: 8 }}>
                <Image
                  src={`/api/accounting/scan-bill/image?id=${showImage}`}
                  alt="bill"
                  width={1400}
                  height={1800}
                  unoptimized
                  style={{ maxWidth: '85vw', height: 'auto', maxHeight: '80vh', objectFit: 'contain', border: '1px solid #d1d5db', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AccWindow>
  )
}
