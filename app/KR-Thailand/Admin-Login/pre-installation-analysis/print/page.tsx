"use client"

import React, { useEffect, useState, Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

interface AnalysisData {
  id: string; branch: string; location: string; equipment: string
  datetime: string; measurementPeriod: string; technician: string
  voltage: string; frequency: number; powerFactor: number; thd: number
  current_L1: number; current_L2: number; current_L3: number; current_N: number
  balance: string; result: string; recommendation: string; notes: string
  recommendedProduct?: string; mainBreakerAmps?: number
  engineerName: string; engineerLicense: string
  approvalStatus: string; approvalDate: string; approverName: string
  created_at: string
}

interface BatchRecord {
  id: number; date: string; time: string
  L1: string; L2: string; L3: string; N: string
  voltage: string; pf: string; note?: string
}

interface Batch {
  batchId: string; customerName: string; location: string
  createdAt: string; cusID?: number | null; records: BatchRecord[]
}

function toNum(v: string | number | null | undefined) {
  const n = parseFloat(String(v ?? '').replace(/,/g, '').trim())
  return Number.isFinite(n) ? n : 0
}

function parseHour(time: string) {
  const m = String(time || '').match(/(\d{1,2}):(\d{2})/)
  return m ? parseInt(m[1], 10) : -1
}

function parseMs(date: string, time: string): number | null {
  if (!date || !time) return null
  const t = /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : time
  const d = new Date(`${date}T${t}`)
  return isNaN(d.getTime()) ? null : d.getTime()
}

function PrintContent() {
  const searchParams = useSearchParams()
  const id = searchParams?.get('id') || ''
  const batchId = searchParams?.get('batchId') || ''
  const auto = searchParams?.get('autoPrint')
  const paramLang = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('lang') : null
  const [lang, setLang] = useState<'th' | 'en'>(() => {
    if (paramLang === 'en') return 'en'
    if (paramLang === 'th') return 'th'
    try { const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang'); return l === 'en' ? 'en' : 'th' } catch { return 'th' }
  })

  const [data, setData] = useState<AnalysisData | null>(null)
  const [batch, setBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const L = (en: string, th: string) => lang === 'th' ? th : en

  useEffect(() => {
    if (!id) { setLoading(false); return }
    ;(async () => {
      try {
        const [ar, br] = await Promise.all([
          fetch('/api/thailand/pre-install-analysis').then(r => r.json()),
          fetch('/api/thailand/pre-install-batches').then(r => r.json()),
        ])
        const found: AnalysisData = (ar.analyses || []).find((a: AnalysisData) => a.id === id)
        if (!found) { setError('ไม่พบข้อมูล'); setLoading(false); return }
        setData(found)
        if (batchId) {
          const b: Batch = (br.batches || []).find((x: Batch) => x.batchId === batchId) || null
          setBatch(b)
        }
      } catch (e: any) { setError(String(e)) }
      finally { setLoading(false) }
    })()
  }, [id, batchId])

  useEffect(() => {
    // Force scroll on body/html overridden by globals.css height:100%
    const html = document.documentElement
    const body = document.body
    const prev = { hH: html.style.height, hO: html.style.overflowY, bH: body.style.height, bO: body.style.overflowY }
    html.style.height = 'auto'
    html.style.overflowY = 'auto'
    body.style.height = 'auto'
    body.style.overflowY = 'auto'
    return () => {
      html.style.height = prev.hH
      html.style.overflowY = prev.hO
      body.style.height = prev.bH
      body.style.overflowY = prev.bO
    }
  }, [])

  useEffect(() => {
    if (data && (auto === '1' || auto === 'true')) setTimeout(() => { try { window.print() } catch {} }, 500)
  }, [data, auto])

  const metrics = useMemo(() => {
    if (!data) return null
    const L1 = toNum(data.current_L1)
    const L2 = toNum(data.current_L2)
    const L3 = toNum(data.current_L3)
    const N  = toNum(data.current_N)
    const nomV = toNum(data.voltage) || 380
    const pf   = toNum(data.powerFactor) || 0.85
    const thd  = toNum(data.thd)
    const avg3 = (L1 + L2 + L3) / 3
    const maxI = Math.max(L1, L2, L3)
    const minI = Math.min(L1, L2, L3)
    const nemaImb = avg3 > 0 ? (Math.max(...[L1,L2,L3].map(v => Math.abs(v - avg3))) / avg3) * 100 : 0

    // Power
    const S = Math.round(Math.sqrt(3) * nomV * avg3 / 1000 * 100) / 100
    const P = Math.round(S * pf * 100) / 100
    const Q = Math.round(Math.sqrt(Math.max(0, S**2 - P**2)) * 100) / 100
    const capKvar = avg3 > 0 ? Math.round(P * (Math.tan(Math.acos(pf)) - Math.tan(Math.acos(0.95))) * 100) / 100 : 0

    // KSAVER sizing
    const breakerKva = data.mainBreakerAmps ? Math.round(Math.sqrt(3) * nomV * data.mainBreakerAmps / 1000 * 10) / 10 : null
    const ksaverKva = breakerKva ? Math.max(S, breakerKva) : S
    const ksaverModel = ksaverKva <= 30 ? 'KSAVER-30' : ksaverKva <= 50 ? 'KSAVER-50' : ksaverKva <= 75 ? 'KSAVER-75' : ksaverKva <= 100 ? 'KSAVER-100' : `KSAVER-${Math.ceil(ksaverKva / 25) * 25}`

    // Quality score: PF 40%, Imbalance 30%, THD 20%, LoadFactor 10% (LF default 60 if no data)
    const pfScore    = Math.min(100, pf >= 0.95 ? 100 : pf >= 0.85 ? 70 : 40) * 0.40
    const imbScore   = Math.min(100, nemaImb < 5 ? 100 : nemaImb < 10 ? 60 : 20) * 0.30
    const thdScore   = Math.min(100, thd <= 5 ? 100 : thd <= 8 ? 70 : 30) * 0.20
    const lfScore    = 60 * 0.10
    const qScore     = Math.round(pfScore + imbScore + thdScore + lfScore)
    const qGrade     = qScore >= 80 ? 'A' : qScore >= 65 ? 'B' : qScore >= 50 ? 'C' : 'D'

    // Batch-derived metrics
    let batchStats: any = null
    if (batch && batch.records.length > 0) {
      const rows = batch.records
        .filter(r => r.L1 !== '' || r.L2 !== '' || r.L3 !== '')
        .map(r => {
          const l1 = toNum(r.L1); const l2 = toNum(r.L2); const l3 = toNum(r.L3); const n = toNum(r.N)
          const active = [l1,l2,l3].filter(v => v > 0)
          const avgI = active.length ? active.reduce((s,v) => s+v,0)/active.length : 0
          const v = toNum(r.voltage) || nomV
          const p2 = toNum(r.pf) || pf
          const powerKw = avgI > 0 ? (Math.sqrt(3) * v * avgI * p2) / 1000 : 0
          const hour = parseHour(r.time)
          const ts = parseMs(r.date, r.time)
          return { l1, l2, l3, n, avgI, powerKw, v, p2, hour, ts, date: r.date, time: r.time }
        })

      const validA = rows.filter(r => r.l1 > 0), validB = rows.filter(r => r.l2 > 0), validC = rows.filter(r => r.l3 > 0)
      const avgA = validA.length ? validA.reduce((s,r) => s+r.l1, 0)/validA.length : 0
      const avgB = validB.length ? validB.reduce((s,r) => s+r.l2, 0)/validB.length : 0
      const avgC = validC.length ? validC.reduce((s,r) => s+r.l3, 0)/validC.length : 0
      const peakA = validA.length ? Math.max(...validA.map(r => r.l1)) : 0
      const peakB = validB.length ? Math.max(...validB.map(r => r.l2)) : 0
      const peakC = validC.length ? Math.max(...validC.map(r => r.l3)) : 0

      const voltages = rows.map(r => r.v).filter(v => v > 0)
      const vAvg = voltages.length ? voltages.reduce((s,v) => s+v,0)/voltages.length : nomV
      const vMax = voltages.length ? Math.max(...voltages) : nomV
      const vMin = voltages.length ? Math.min(...voltages) : nomV
      const vStd = voltages.length > 1 ? Math.sqrt(voltages.reduce((s,v) => s+(v-vAvg)**2,0)/voltages.length) : 0

      const allPhase = rows.filter(r => r.l1>0 && r.l2>0 && r.l3>0)
      const rowImbs = allPhase.map(r => { const a3=(r.l1+r.l2+r.l3)/3; return a3>0?(Math.max(Math.abs(r.l1-a3),Math.abs(r.l2-a3),Math.abs(r.l3-a3))/a3)*100:0 })
      const avgImb = rowImbs.length ? rowImbs.reduce((s,v) => s+v,0)/rowImbs.length : 0
      const maxImb = rowImbs.length ? Math.max(...rowImbs) : 0

      const peakKw = rows.length ? Math.max(...rows.map(r => r.powerKw)) : 0
      const dayRows = rows.filter(r => r.hour >= 8 && r.hour <= 16)
      const nightRows = rows.filter(r => r.hour >= 0 && r.hour <= 4)
      const dayKw = dayRows.length ? dayRows.reduce((s,r) => s+r.powerKw,0)/dayRows.length : 0
      const nightKw = nightRows.length ? nightRows.reduce((s,r) => s+r.powerKw,0)/nightRows.length : 0

      // Interval energy
      const timedRows = rows.filter(r => r.ts !== null).sort((a,b) => (a.ts!-b.ts!))
      let coverageH = 0, energyKwh = 0
      for (let i = 0; i < timedRows.length-1; i++) {
        const dt = (timedRows[i+1].ts! - timedRows[i].ts!) / 3600000
        if (dt <= 0 || dt > 24) continue
        energyKwh += ((timedRows[i].powerKw + timedRows[i+1].powerKw) / 2) * dt
        coverageH += dt
      }
      const avgKw = coverageH > 0 ? energyKwh/coverageH : rows.reduce((s,r) => s+r.powerKw,0)/(rows.length||1)
      const lf = peakKw > 0 ? (avgKw/peakKw)*100 : 0
      const dailyKwh = coverageH > 0 ? energyKwh : avgKw*24
      const monthKwh = dailyKwh * 30

      // Hourly profile
      const hourMap: Record<number, number[]> = {}
      rows.forEach(r => { if (r.hour>=0) { if (!hourMap[r.hour]) hourMap[r.hour]=[]; hourMap[r.hour].push(r.powerKw) }})
      const hourlyProfile = Array.from({length:24},(_,h) => ({ h, avg: hourMap[h]?.length ? hourMap[h].reduce((s,v)=>s+v,0)/hourMap[h].length : 0 }))
      const peakHour = hourlyProfile.reduce((best,x) => x.avg > best.avg ? x : best, {h:0,avg:0})
      const baseHour = hourlyProfile.filter(x => x.avg > 0).reduce((best,x) => x.avg < best.avg ? x : best, {h:0,avg:Infinity})

      // Voltage deviation %
      const devPct = ((vAvg - nomV) / nomV) * 100

      batchStats = {
        rows: rows.length, avgA, avgB, avgC, peakA, peakB, peakC,
        vAvg, vMax, vMin, vStd, devPct,
        avgImb, maxImb,
        peakKw, dayKw, nightKw, avgKw, lf,
        dailyKwh, monthKwh, energyKwh, coverageH,
        hourlyProfile, peakHour, baseHour: baseHour.avg === Infinity ? null : baseHour,
      }
    }

    return { L1,L2,L3,N,nomV,pf,thd,avg3,maxI,minI,nemaImb,S,P,Q,capKvar,ksaverModel,ksaverKva,breakerKva,qScore,qGrade,batchStats }
  }, [data, batch])

  if (!id) return <div style={{padding:20}}>Missing id</div>
  if (loading) return <div style={{padding:20}}>Loading...</div>
  if (error) return <div style={{padding:20,color:'red'}}>{error}</div>
  if (!data || !metrics) return <div style={{padding:20}}>ไม่พบข้อมูล</div>

  const { L1,L2,L3,N,nomV,pf,thd,avg3,maxI,minI,nemaImb,S,P,Q,capKvar,ksaverModel,ksaverKva,breakerKva,qScore,qGrade,batchStats } = metrics
  const bs = batchStats

  // IEC helpers
  const iecImb  = nemaImb < 5  ? {c:'#16a34a',bg:'#f0fdf4',b:'#86efac',t:'✓ Pass (IEC 60034-26)'} : nemaImb < 10 ? {c:'#d97706',bg:'#fffbeb',b:'#fde68a',t:'⚠ Warn'} : {c:'#dc2626',bg:'#fef2f2',b:'#fca5a5',t:'✗ Fail'}
  const iecVolt = bs ? (Math.abs(bs.devPct) <= 10 ? {c:'#16a34a',t:'✓ IEC 60038 ±10%'} : {c:'#dc2626',t:'✗ Out of IEC 60038'}) : null
  const pfBadge = pf >= 0.95 ? {c:'#16a34a',t:'✓ ดี (≥ 0.95)'} : pf >= 0.85 ? {c:'#d97706',t:'⚠ ปานกลาง (0.85-0.95)'} : {c:'#dc2626',t:'✗ ต่ำ (< 0.85)'}
  const thdBadge = thd <= 5 ? {c:'#16a34a',t:'✓ IEEE 519 / IEC 61000-3-2'} : thd <= 8 ? {c:'#d97706',t:'⚠ Elevated'} : {c:'#dc2626',t:'✗ High THD'}
  const resultColor = data.result === 'Recommended' ? '#16a34a' : data.result === 'Not Recommended' ? '#dc2626' : '#d97706'
  const approvalColor = data.approvalStatus === 'Approved' ? '#16a34a' : data.approvalStatus === 'Rejected' ? '#dc2626' : '#d97706'

  // Phase rows for current table
  const phases = [
    {name:'L1',value:L1,color:'#d97706',isLine:true},
    {name:'L2',value:L2,color:'#2563eb',isLine:true},
    {name:'L3',value:L3,color:'#7c3aed',isLine:true},
    {name:'N', value:N, color:'#6b7280',isLine:false},
  ]

  // Auto recommendations
  const recs: {priority:'high'|'medium'|'low',title:string,action:string}[] = []
  const lfVal = bs?.lf ?? 0
  if (pf < 0.85) recs.push({priority:'high',title:L('Install Capacitor Bank','ติดตั้ง Capacitor Bank ด่วน'),action:L(`PF=${pf.toFixed(2)} is critically low. Install ${capKvar.toFixed(0)} kVAR capacitor bank immediately.`,`PF=${pf.toFixed(2)} ต่ำมาก ติดตั้ง Capacitor ${capKvar.toFixed(0)} kVAR ทันที`)})
  if (nemaImb >= 10) recs.push({priority:'high',title:L('Urgent Load Balancing','สมดุลโหลดด่วน'),action:L(`Imbalance ${nemaImb.toFixed(1)}% exceeds IEC 10% limit.`,`ความไม่สมดุล ${nemaImb.toFixed(1)}% เกินมาตรฐาน IEC 10%`)})
  if (thd > 8) recs.push({priority:'high',title:L('Install Harmonic Filter','ติดตั้ง Harmonic Filter'),action:L(`THD=${thd.toFixed(1)}% exceeds IEEE 519 limit (5%).`,`THD=${thd.toFixed(1)}% เกิน IEEE 519 (5%)`)})
  if (pf >= 0.85 && pf < 0.95) recs.push({priority:'medium',title:L('Power Factor Correction','ปรับ Power Factor'),action:L(`PF=${pf.toFixed(2)}. Install ${capKvar.toFixed(0)} kVAR.`,`PF=${pf.toFixed(2)} ติดตั้ง ${capKvar.toFixed(0)} kVAR`)})
  if (nemaImb >= 5 && nemaImb < 10) recs.push({priority:'medium',title:L('Check Load Balance','ตรวจสอบสมดุลโหลด'),action:L(`Imbalance ${nemaImb.toFixed(1)}%, target < 5%.`,`ความไม่สมดุล ${nemaImb.toFixed(1)}% เป้าหมาย < 5%`)})
  if (thd > 5 && thd <= 8) recs.push({priority:'medium',title:L('Consider Harmonic Filter','พิจารณา Harmonic Filter'),action:L(`THD=${thd.toFixed(1)}% elevated.`,`THD=${thd.toFixed(1)}% ค่อนข้างสูง`)})
  if (bs && lfVal < 40) recs.push({priority:'medium',title:L('Energy Management','จัดการพลังงาน'),action:L(`Load factor ${lfVal.toFixed(1)}% is low.`,`Load Factor ${lfVal.toFixed(1)}% ต่ำ ปรับปรุงประสิทธิภาพ`)})
  recs.push({priority:'low',title:L(`Install ${ksaverModel}`,`ติดตั้ง ${ksaverModel}`),action:L(`Recommended KSAVER unit ${ksaverModel} (${ksaverKva.toFixed(1)} kVA) for this site.`,`แนะนำ ${ksaverModel} (${ksaverKva.toFixed(1)} kVA)`)})

  const updateLang = (l: string) => { try { const u=new URL(window.location.href); u.searchParams.set('lang',l); window.history.replaceState(null,'',u.toString()) } catch{} }

  // Hourly bar chart as ASCII-like table for print
  const renderHourlyBars = () => {
    if (!bs?.hourlyProfile) return null
    const maxVal = Math.max(...bs.hourlyProfile.map((x: any) => x.avg), 0.01)
    return (
      <div style={{display:'grid',gridTemplateColumns:'repeat(24,1fr)',gap:1,alignItems:'flex-end',height:60,marginTop:8}}>
        {bs.hourlyProfile.map((x: any) => (
          <div key={x.h} style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{width:'100%',background: x.h>=8&&x.h<=16?'#3b82f6':'#94a3b8',borderRadius:2,height:`${Math.round((x.avg/maxVal)*50)+2}px`}} />
            <span style={{fontSize:'6pt',color:'#888'}}>{x.h%6===0?x.h:''}</span>
          </div>
        ))}
      </div>
    )
  }

  // Current bar chart (phase comparison)
  const renderPhaseBars = (items: {label:string,avg:number,peak:number,color:string}[]) => {
    const maxVal = Math.max(...items.flatMap(i => [i.avg,i.peak]), 0.01)
    return (
      <div style={{display:'flex',gap:12,alignItems:'flex-end',height:60,marginTop:8}}>
        {items.map(item => (
          <div key={item.label} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
            <div style={{width:'100%',position:'relative',height:50,display:'flex',alignItems:'flex-end',gap:2}}>
              <div style={{flex:1,background:item.color+'99',borderRadius:'2px 2px 0 0',height:`${(item.avg/maxVal)*48}px`}} title={`Avg ${item.avg.toFixed(1)}A`} />
              <div style={{flex:1,background:item.color,borderRadius:'2px 2px 0 0',height:`${(item.peak/maxVal)*48}px`}} title={`Peak ${item.peak.toFixed(1)}A`} />
            </div>
            <span style={{fontSize:'8pt',fontWeight:700,color:item.color}}>{item.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 1.2cm 1.8cm 1.2cm 1.8cm; }
        @media print { .no-print{display:none!important} body{margin:0;padding:0} .a4{box-shadow:none!important} .pgbrk{page-break-before:always} }
        @media screen { html,body{height:auto!important;overflow-y:auto!important;background:#ddd} }
        *{box-sizing:border-box}
        body{font-family:'Sarabun','Segoe UI',sans-serif;font-size:9.5pt;color:#333}
        .a4{width:100%;max-width:195mm;margin:6mm auto;padding:8mm 10mm;background:white;box-shadow:0 2px 8px rgba(0,0,0,.15)}
        .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;padding-bottom:10px;border-bottom:3px solid #dc2626}
        .cname{font-size:16pt;font-weight:700;color:#dc2626}
        .csub{font-size:9.5pt;font-weight:600;color:#444}
        .caddr{font-size:8pt;color:#777;line-height:1.5;margin-top:5px}
        .dtitle h1{font-size:14pt;font-weight:700;color:#dc2626;text-align:right;margin:0}
        .dtitle h2{font-size:10pt;color:#666;text-align:right;margin:2px 0 0}
        .docid{font-size:8.5pt;color:#999;text-align:right;margin-top:3px}
        .sec{border:1px solid #e2e8f0;border-radius:5px;padding:8px 10px;margin-bottom:10px}
        .st{font-weight:700;font-size:9.5pt;color:#dc2626;margin-bottom:7px;padding-bottom:4px;border-bottom:1px solid #fecaca}
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:7px}
        .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
        .g4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:5px}
        .ir{display:flex;margin-bottom:4px;font-size:9pt}
        .il{width:105px;font-weight:600;color:#555;flex-shrink:0}
        .iv{flex:1;color:#222}
        .mbox{border-radius:5px;padding:7px;text-align:center}
        .ml{font-size:7.5pt;font-weight:600;margin-bottom:2px}
        .mv{font-size:13pt;font-weight:700}
        .tbl{width:100%;border-collapse:collapse;font-size:9pt}
        .tbl th{background:#fef2f2;color:#dc2626;font-weight:700;padding:5px 7px;text-align:left;border-bottom:2px solid #fecaca}
        .tbl td{padding:4px 7px;border-bottom:1px solid #f1f5f9}
        .tbl tr:last-child td{border-bottom:none}
        .badge{display:inline-block;padding:1px 7px;border-radius:20px;font-size:8pt;font-weight:600}
        .abox{border-radius:5px;padding:7px 9px;font-size:8.5pt;margin-top:5px;line-height:1.5}
        .srow{display:flex;justify-content:space-between;margin-top:16px;padding-top:14px;border-top:1px solid #e5e7eb}
        .sbox{width:30%;text-align:center}
        .sline{border-bottom:1px solid #888;min-height:44px;margin-bottom:5px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:3px}
        .sname{font-size:9pt;font-weight:600}
        .ssub{font-size:8pt;color:#888}
        .foot{display:flex;justify-content:space-between;font-size:7.5pt;color:#bbb;margin-top:10px;padding-top:5px;border-top:1px solid #eee}
        .rbox{border-radius:0 5px 5px 0;padding:7px 9px;margin-bottom:5px;border-left:3px solid}
        .hl{border-left-color:#ef4444;background:#fef2f2}
        .ml-r{border-left-color:#f59e0b;background:#fffbeb}
        .ll{border-left-color:#3b82f6;background:#eff6ff}
        .sc-bar{height:8px;border-radius:4px;margin-top:2px}
        .execbox{background:linear-gradient(135deg,#1e3a5f,#1e40af);color:white;border-radius:8px;padding:10px 12px;margin-bottom:10px}
      `}</style>

      {/* Controls */}
      <div className="no-print" style={{textAlign:'center',padding:'8px',background:'#f5f5f5',borderBottom:'1px solid #ddd',marginBottom:6}}>
        {(['th','en'] as const).map(l => (
          <button key={l} onClick={() => { setLang(l); updateLang(l) }}
            style={{marginRight:6,padding:'4px 12px',fontSize:11,borderRadius:20,border:lang===l?'2px solid #e67e22':'1px solid #ccc',background:lang===l?'#fff5eb':'#fff',cursor:'pointer',fontWeight:lang===l?600:400}}>
            {l==='th'?'ไทย':'English'}
          </button>
        ))}
        <button onClick={() => window.print()} style={{marginLeft:10,padding:'4px 16px',fontSize:11,borderRadius:20,border:'1px solid #e67e22',background:'#e67e22',color:'white',cursor:'pointer',fontWeight:600}}>
          {L('Print','พิมพ์')}
        </button>
      </div>

      <div className="a4">
        {/* ── HEADER ── */}
        <div className="hdr">
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <img src="/k-energy-save-logo.jpg" alt="Logo" style={{width:62,height:62,borderRadius:5,objectFit:'contain',border:'1px solid #ddd',padding:3,background:'#fff'}} />
              <div>
                <div className="cname">{L('K Energy Save','เค อีเนอร์ยี่ เซฟ')}</div>
                <div className="csub">{L('K Energy Save Co., Ltd.','บริษัท เค อีเนอร์ยี่ เซฟ จำกัด')}</div>
              </div>
            </div>
            <div className="caddr">84 Chaloem Phrakiat Rama 9 Soi 34, Nong Bon, Prawet, Bangkok 10250<br/>Tel: 02-080-8916 | info@kenergy-save.com</div>
          </div>
          <div className="dtitle">
            <h1>{L('PRE-INSTALLATION','รายงานก่อนติดตั้ง')}</h1>
            <h2>{L('Current Analysis Report','รายงานวิเคราะห์กระแสไฟฟ้า')}</h2>
            <div className="docid">{L('Doc:','เลขที่:')} <strong>{data.id}</strong></div>
          </div>
        </div>

        {/* ── 1. ข้อมูลพื้นฐาน ── */}
        <div className="sec">
          <div className="st">📋 {L('Basic Information','ข้อมูลพื้นฐาน')}</div>
          <div className="g2">
            <div>
              <div className="ir"><span className="il">{L('Doc No.:','เลขที่เอกสาร:')}</span><span className="iv" style={{fontWeight:700}}>{data.id}</span></div>
              <div className="ir"><span className="il">{L('Date/Time:','วันที่/เวลา:')}</span><span className="iv">{data.datetime||'-'}</span></div>
              <div className="ir"><span className="il">{L('Location:','สถานที่:')}</span><span className="iv">{data.location||'-'}</span></div>
            </div>
            <div>
              <div className="ir"><span className="il">{L('Technician:','ช่างเทคนิค:')}</span><span className="iv">{data.technician||'-'}</span></div>
              <div className="ir"><span className="il">{L('Equipment:','อุปกรณ์:')}</span><span className="iv">{data.equipment||'-'}</span></div>
              <div className="ir"><span className="il">{L('Period:','ระยะเวลา:')}</span><span className="iv">{data.measurementPeriod||'-'}</span></div>
              {data.mainBreakerAmps && <div className="ir"><span className="il">{L('Breaker:','เบรกเกอร์:')}</span><span className="iv">{data.mainBreakerAmps}A {breakerKva ? `≈ ${breakerKva}kVA` : ''}</span></div>}
            </div>
          </div>
        </div>

        {/* ── 2. พารามิเตอร์ไฟฟ้า ── */}
        <div className="sec">
          <div className="st">⚡ {L('Electrical Parameters','พารามิเตอร์ไฟฟ้า')}</div>
          <div className="g4">
            <div className="mbox" style={{background:'#eff6ff',border:'1px solid #bfdbfe'}}>
              <div className="ml" style={{color:'#1d4ed8'}}>{L('Voltage','แรงดัน')}</div>
              <div className="mv" style={{color:'#1e40af'}}>{nomV}<span style={{fontSize:'8pt',fontWeight:400}}> V</span></div>
            </div>
            <div className="mbox" style={{background:'#f0fdf4',border:'1px solid #bbf7d0'}}>
              <div className="ml" style={{color:'#15803d'}}>{L('Frequency','ความถี่')}</div>
              <div className="mv" style={{color:'#166534'}}>{data.frequency}<span style={{fontSize:'8pt',fontWeight:400}}> Hz</span></div>
            </div>
            <div className="mbox" style={{background:'#fefce8',border:'1px solid #fde68a'}}>
              <div className="ml" style={{color:'#a16207'}}>{L('Power Factor','ตัวประกอบกำลัง')}</div>
              <div className="mv" style={{color:'#92400e'}}>{pf.toFixed(2)}</div>
            </div>
            <div className="mbox" style={{background:'#fff1f2',border:'1px solid #fecdd3'}}>
              <div className="ml" style={{color:'#be123c'}}>THD (%)</div>
              <div className="mv" style={{color:'#9f1239'}}>{thd.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* ── 3. การวัดกระแสไฟฟ้า ── */}
        <div className="sec">
          <div className="st">〰️ {L('Current Measurement','การวัดกระแสไฟฟ้า')}</div>
          <table className="tbl">
            <thead>
              <tr>
                <th>{L('Phase','เฟส')}</th>
                <th style={{textAlign:'right'}}>{L('Current (A)','กระแส (A)')}</th>
                <th style={{textAlign:'right'}}>{L('% of Max','% ของค่าสูงสุด')}</th>
                <th style={{textAlign:'right'}}>{L('Dev from Avg','เบี่ยงเบนจากเฉลี่ย')}</th>
                <th style={{textAlign:'center'}}>{L('IEC Status','สถานะ IEC')}</th>
              </tr>
            </thead>
            <tbody>
              {phases.map(ph => {
                const pctMax = maxI>0 && ph.isLine ? (ph.value/maxI)*100 : null
                const dev    = ph.isLine && avg3>0 ? ((ph.value-avg3)/avg3)*100 : null
                const nRatio = !ph.isLine && avg3>0 ? (ph.value/avg3)*100 : null
                let bg='background:#f3f4f6;color:#6b7280', bl='—'
                if (ph.isLine && dev!==null) { const a=Math.abs(dev); if(a<5){bg='background:#f0fdf4;color:#16a34a';bl='✓ Pass'}else if(a<10){bg='background:#fffbeb;color:#d97706';bl='⚠ Warn'}else{bg='background:#fef2f2;color:#dc2626';bl='✗ Fail'} }
                else if (!ph.isLine && nRatio!==null) { if(nRatio<15){bg='background:#f0fdf4;color:#16a34a';bl='✓ OK'}else if(nRatio<30){bg='background:#fffbeb;color:#d97706';bl='⚠ Warn'}else{bg='background:#fef2f2;color:#dc2626';bl='✗ High'} }
                const bStyle = Object.fromEntries(bg.split(';').map(s=>{ const [k,v]=s.split(':'); return [k.trim().replace(/-([a-z])/g,(_:any,c:string)=>c.toUpperCase()),v?.trim()] }))
                return (
                  <tr key={ph.name} style={{background:ph.isLine&&ph.value===maxI&&maxI>0?'#fff7ed':''}}>
                    <td style={{fontWeight:700,color:ph.color}}>
                      {L('Phase','เฟส')} {ph.name}
                      {ph.isLine&&ph.value===maxI&&maxI>0&&<span style={{marginLeft:3,fontSize:'7pt',background:'#fed7aa',color:'#c2410c',padding:'1px 4px',borderRadius:10}}>MAX</span>}
                      {ph.isLine&&ph.value===minI&&maxI!==minI&&<span style={{marginLeft:3,fontSize:'7pt',background:'#dbeafe',color:'#1d4ed8',padding:'1px 4px',borderRadius:10}}>MIN</span>}
                    </td>
                    <td style={{textAlign:'right',fontWeight:600}}>{ph.value.toFixed(1)} A</td>
                    <td style={{textAlign:'right',color:'#666'}}>{pctMax!==null?`${pctMax.toFixed(1)}%`:nRatio!==null?`${nRatio.toFixed(1)}%`:'—'}</td>
                    <td style={{textAlign:'right'}}>{dev!==null?<span style={{color:dev>=0?'#d97706':'#2563eb',fontWeight:600}}>{dev>=0?'+':''}{dev.toFixed(2)}%</span>:<span style={{color:'#ccc'}}>—</span>}</td>
                    <td style={{textAlign:'center'}}><span className="badge" style={bStyle}>{bl}</span></td>
                  </tr>
                )
              })}
              <tr style={{background:'#f8fafc',fontWeight:600}}>
                <td>{L('3Φ Average','ค่าเฉลี่ย 3เฟส')}</td>
                <td style={{textAlign:'right'}}>{avg3.toFixed(1)} A</td>
                <td colSpan={2} style={{textAlign:'center',fontSize:'8.5pt',color:'#666'}}>{L('Imbalance','ความไม่สมดุล')}: <strong>{nemaImb.toFixed(2)}%</strong></td>
                <td style={{textAlign:'center'}}><span className="badge" style={{background:iecImb.bg,color:iecImb.c,border:`1px solid ${iecImb.b}`}}>{iecImb.t}</span></td>
              </tr>
            </tbody>
          </table>
          <div className="abox" style={{background:'#f0f9ff',border:'1px solid #bae6fd',color:'#0369a1'}}>
            {L(`Balance: ${data.balance} | IEC 60034-26 Imbalance: ${nemaImb.toFixed(2)}% — ${nemaImb<5?'Excellent (<5%)':nemaImb<10?'Acceptable (5-10%)':'Poor (>10%)'}`,
               `สมดุล: ${data.balance} | ความไม่สมดุล IEC 60034-26: ${nemaImb.toFixed(2)}% — ${nemaImb<5?'ดีเยี่ยม (<5%)':nemaImb<10?'พอใช้ได้ (5-10%)':'ไม่ดี (>10%)'}`)}
          </div>
        </div>

        {/* ── 4. กราฟกระแส / Current Graph metrics ── */}
        {bs && (
          <div className="sec">
            <div className="st">📈 {L('Current Graph — Measurement Summary','กราฟกระแสไฟฟ้า — สรุปค่าวัด')}</div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>{L('Item','รายการ')}</th>
                  <th style={{textAlign:'right'}}>{L('Phase A (L1)','เฟส A (L1)')}</th>
                  <th style={{textAlign:'right'}}>{L('Phase B (L2)','เฟส B (L2)')}</th>
                  <th style={{textAlign:'right'}}>{L('Phase C (L3)','เฟส C (L3)')}</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>⚡ {L('Peak Current (A)','กระแสสูงสุด (A)')}</td><td style={{textAlign:'right',fontWeight:600}}>{bs.peakA.toFixed(1)}</td><td style={{textAlign:'right',fontWeight:600}}>{bs.peakB.toFixed(1)}</td><td style={{textAlign:'right',fontWeight:600}}>{bs.peakC.toFixed(1)}</td></tr>
                <tr><td>☀️ {L('Daytime Avg 08-16 (A)','เฉลี่ยกลางวัน 08-16 (A)')}</td><td style={{textAlign:'right'}}>{bs.dayKw>0?'—':L('N/A','ไม่มีข้อมูล')}</td><td style={{textAlign:'right'}}>—</td><td style={{textAlign:'right'}}>—</td></tr>
                <tr><td>🌙 {L('Night Base 00-04 (A)','ฐานกลางคืน 00-04 (A)')}</td><td style={{textAlign:'right'}}>—</td><td style={{textAlign:'right'}}>—</td><td style={{textAlign:'right'}}>—</td></tr>
                <tr style={{background:'#f8fafc',fontWeight:600}}>
                  <td>📊 {L('Overall Average (A)','เฉลี่ยรวม (A)')}</td>
                  <td style={{textAlign:'right'}}>{bs.avgA.toFixed(1)}</td>
                  <td style={{textAlign:'right'}}>{bs.avgB.toFixed(1)}</td>
                  <td style={{textAlign:'right'}}>{bs.avgC.toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
            <div style={{marginTop:6}}>
              <div style={{fontSize:'8.5pt',fontWeight:600,color:'#555',marginBottom:3}}>{L('Phase Current Bar Chart','แผนภูมิแท่งกระแสต่อเฟส')} ({L('Avg light, Peak dark','เฉลี่ย=อ่อน, สูงสุด=เข้ม')})</div>
              {renderPhaseBars([
                {label:'L1',avg:bs.avgA,peak:bs.peakA,color:'#f59e0b'},
                {label:'L2',avg:bs.avgB,peak:bs.peakB,color:'#3b82f6'},
                {label:'L3',avg:bs.avgC,peak:bs.peakC,color:'#8b5cf6'},
              ])}
            </div>
            <div className="abox" style={{background:'#f0fdf4',border:'1px solid #bbf7d0',color:'#166534'}}>
              {L(`Phase imbalance (NEMA/IEC 60034-26): avg ${bs.avgImb.toFixed(2)}%, worst ${bs.maxImb.toFixed(2)}%. Keep below 5% for best motor life.`,
                 `ความไม่สมดุลต่อแถว (NEMA/IEC): เฉลี่ย ${bs.avgImb.toFixed(2)}%, แย่สุด ${bs.maxImb.toFixed(2)}% — ควรต่ำกว่า 5%`)}
            </div>
          </div>
        )}

        {/* ── 5. กราฟพลังงาน / Power Graph ── */}
        {bs && (
          <div className="sec">
            <div className="st">🔋 {L('Power Graph — Metrics Table','กราฟพลังงาน — ตารางตัวชี้วัด')}</div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>{L('Item','รายการ')}</th>
                  <th style={{textAlign:'right'}}>{L('Measured','ค่าที่วัดได้')}</th>
                  <th style={{textAlign:'center'}}>{L('Standard','มาตรฐาน')}</th>
                  <th style={{textAlign:'center'}}>{L('Result','ผล')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{L('Load Factor (%)','Load Factor (%)')}</td>
                  <td style={{textAlign:'right',fontWeight:600}}>{bs.lf.toFixed(1)}%</td>
                  <td style={{textAlign:'center',fontSize:'8pt',color:'#666'}}>≥ 60%</td>
                  <td style={{textAlign:'center'}}><span className="badge" style={{background:bs.lf>=60?'#f0fdf4':'#fef2f2',color:bs.lf>=60?'#16a34a':'#dc2626'}}>{bs.lf>=60?'✓ Pass':'✗ Low'}</span></td>
                </tr>
                <tr>
                  <td>{L('Average Power Factor','ตัวประกอบกำลังเฉลี่ย')}</td>
                  <td style={{textAlign:'right',fontWeight:600}}>{pf.toFixed(2)}</td>
                  <td style={{textAlign:'center',fontSize:'8pt',color:'#666'}}>≥ 0.95</td>
                  <td style={{textAlign:'center'}}><span className="badge" style={{background:pfBadge.c==='#16a34a'?'#f0fdf4':pfBadge.c==='#d97706'?'#fffbeb':'#fef2f2',color:pfBadge.c}}>{pfBadge.c==='#16a34a'?'✓':pfBadge.c==='#d97706'?'⚠':'✗'}</span></td>
                </tr>
                <tr>
                  <td>{L('Current Imbalance','ความไม่สมดุลกระแส')}</td>
                  <td style={{textAlign:'right',fontWeight:600}}>{bs.avgImb.toFixed(2)}%</td>
                  <td style={{textAlign:'center',fontSize:'8pt',color:'#666'}}>&lt; 5% (IEC)</td>
                  <td style={{textAlign:'center'}}><span className="badge" style={{background:bs.avgImb<5?'#f0fdf4':bs.avgImb<10?'#fffbeb':'#fef2f2',color:bs.avgImb<5?'#16a34a':bs.avgImb<10?'#d97706':'#dc2626'}}>{bs.avgImb<5?'✓':bs.avgImb<10?'⚠':'✗'}</span></td>
                </tr>
                <tr>
                  <td>{L('Peak Power Demand','ความต้องการสูงสุด')}</td>
                  <td style={{textAlign:'right',fontWeight:600}}>{bs.peakKw.toFixed(2)} kW</td>
                  <td style={{textAlign:'center',fontSize:'8pt',color:'#666'}}>—</td>
                  <td style={{textAlign:'center',color:'#888'}}>—</td>
                </tr>
                <tr>
                  <td>{L('Nighttime Base Load','โหลดฐานกลางคืน')}</td>
                  <td style={{textAlign:'right',fontWeight:600}}>{bs.nightKw.toFixed(2)} kW</td>
                  <td style={{textAlign:'center',fontSize:'8pt',color:'#666'}}>—</td>
                  <td style={{textAlign:'center',color:'#888'}}>—</td>
                </tr>
                <tr>
                  <td>{L('Daytime Avg Power','กำลังเฉลี่ยกลางวัน')}</td>
                  <td style={{textAlign:'right',fontWeight:600}}>{bs.dayKw.toFixed(2)} kW</td>
                  <td style={{textAlign:'center',fontSize:'8pt',color:'#666'}}>—</td>
                  <td style={{textAlign:'center',color:'#888'}}>—</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* PAGE BREAK before detailed analysis */}
        <div className="pgbrk" />

        {/* ── 6. ผลการประเมินและคำแนะนำ ── */}
        <div className="sec">
          <div className="st">✅ {L('Result & Recommendation','ผลการประเมินและคำแนะนำ')}</div>
          <div style={{marginBottom:8}}>
            <span style={{fontWeight:600,fontSize:'9pt',color:'#555'}}>{L('Evaluation Result:','ผลการประเมิน:')}</span>
            <span style={{marginLeft:8,padding:'3px 12px',borderRadius:20,fontWeight:700,fontSize:'10pt',background:data.result==='Recommended'?'#f0fdf4':data.result==='Not Recommended'?'#fef2f2':'#fffbeb',color:resultColor,border:`1px solid ${data.result==='Recommended'?'#86efac':data.result==='Not Recommended'?'#fca5a5':'#fde68a'}`}}>
              {data.result==='Recommended'?'✓':data.result==='Not Recommended'?'✗':'⚠'} {data.result}
            </span>
          </div>
          {data.recommendation&&<div style={{marginBottom:7}}><div style={{fontWeight:600,fontSize:'9pt',color:'#555',marginBottom:2}}>{L('Recommendation:','คำแนะนำ:')}</div><div style={{fontSize:'9pt',whiteSpace:'pre-wrap',padding:'6px 8px',background:'#f8fafc',borderRadius:5,border:'1px solid #e2e8f0',lineHeight:1.6}}>{data.recommendation}</div></div>}
          {data.notes&&<div><div style={{fontWeight:600,fontSize:'9pt',color:'#555',marginBottom:2}}>{L('Notes:','หมายเหตุ:')}</div><div style={{fontSize:'9pt',whiteSpace:'pre-wrap',padding:'6px 8px',background:'#f8fafc',borderRadius:5,border:'1px solid #e2e8f0',lineHeight:1.6}}>{data.notes}</div></div>}
        </div>

        {/* ── 7. การวิเคราะห์แรงดันไฟฟ้าเชิงปริมาณ ── */}
        <div className="sec">
          <div className="st">⚡ 1. {L('Quantified Voltage Analysis','การวิเคราะห์แรงดันไฟฟ้าเชิงปริมาณ')}</div>
          <div className="g4">
            {[
              {label:L('Average Voltage','แรงดันเฉลี่ย'),val:`${bs?bs.vAvg.toFixed(1):nomV} V`,bg:'#eff6ff',bc:'#bfdbfe',c:'#1e40af'},
              {label:L('Peak Voltage','แรงดันสูงสุด'),val:`${bs?bs.vMax.toFixed(1):nomV} V`,bg:'#fff7ed',bc:'#fed7aa',c:'#c2410c'},
              {label:L('Min Voltage','แรงดันต่ำสุด'),val:`${bs?bs.vMin.toFixed(1):nomV} V`,bg:'#f5f3ff',bc:'#ddd6fe',c:'#5b21b6'},
              {label:L('Std Dev','ส่วนเบี่ยงเบน'),val:`${bs?bs.vStd.toFixed(2):'0.00'} V`,bg:'#f8fafc',bc:'#e2e8f0',c:'#475569'},
            ].map(x => (
              <div key={x.label} className="mbox" style={{background:x.bg,border:`1px solid ${x.bc}`}}>
                <div className="ml" style={{color:x.c}}>{x.label}</div>
                <div className="mv" style={{color:x.c,fontSize:'12pt'}}>{x.val}</div>
              </div>
            ))}
          </div>
          <div className="abox" style={{background:'#fffbeb',border:'1px solid #fde68a',color:'#92400e',marginTop:6}}>
            {bs ? L(
              `Average ${bs.vAvg.toFixed(1)}V (${bs.devPct>=0?'+':''}${bs.devPct.toFixed(2)}% from nominal ${nomV}V), range ${(bs.vMax-bs.vMin).toFixed(1)}V (${bs.vMin.toFixed(1)}–${bs.vMax.toFixed(1)}V). ${iecVolt?.t}`,
              `แรงดันเฉลี่ย ${bs.vAvg.toFixed(1)}V (${bs.devPct>=0?'+':''}${bs.devPct.toFixed(2)}% จากพิกัด ${nomV}V) ช่วงแกว่ง ${(bs.vMax-bs.vMin).toFixed(1)}V (${bs.vMin.toFixed(1)}–${bs.vMax.toFixed(1)}V). ${iecVolt?.t}`
            ) : L(`Nominal voltage: ${nomV}V (no time-series data)`,`แรงดันพิกัด: ${nomV}V (ไม่มีข้อมูล time-series)`)}
          </div>
        </div>

        {/* ── 8. การวิเคราะห์กระแสเชิงปริมาณ ── */}
        <div className="sec">
          <div className="st">〰️ 2. {L('Quantified Current Analysis','การวิเคราะห์กระแสเชิงปริมาณ')}</div>
          {bs ? (
            <>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>{L('Phase','เฟส')}</th>
                    <th style={{textAlign:'right'}}>{L('Avg (A)','เฉลี่ย (A)')}</th>
                    <th style={{textAlign:'right'}}>{L('Peak (A)','สูงสุด (A)')}</th>
                    <th style={{textAlign:'right'}}>{L('Dev from Avg','เบี่ยงเบน')}</th>
                    <th style={{textAlign:'right'}}>{L('Load Share (%)','สัดส่วน (%)')}</th>
                  </tr>
                </thead>
                <tbody>
                  {[{l:'L1',a:bs.avgA,p:bs.peakA,c:'#f59e0b'},{l:'L2',a:bs.avgB,p:bs.peakB,c:'#3b82f6'},{l:'L3',a:bs.avgC,p:bs.peakC,c:'#8b5cf6'}].map(ph => {
                    const overallA = (bs.avgA+bs.avgB+bs.avgC)/3
                    const dev = overallA>0?((ph.a-overallA)/overallA)*100:0
                    const share = overallA>0?(ph.a/(overallA*3))*100:33.3
                    return (
                      <tr key={ph.l}>
                        <td style={{fontWeight:700,color:ph.c}}>{ph.l}</td>
                        <td style={{textAlign:'right'}}>{ph.a.toFixed(1)}</td>
                        <td style={{textAlign:'right'}}>{ph.p.toFixed(1)}</td>
                        <td style={{textAlign:'right'}}><span style={{color:dev>=0?'#d97706':'#2563eb',fontWeight:600}}>{dev>=0?'+':''}{dev.toFixed(2)}%</span></td>
                        <td style={{textAlign:'right'}}>{share.toFixed(1)}%</td>
                      </tr>
                    )
                  })}
                  <tr style={{background:'#f8fafc',fontWeight:600}}>
                    <td>{L('Overall Avg','รวมเฉลี่ย')}</td>
                    <td style={{textAlign:'right'}}>{((bs.avgA+bs.avgB+bs.avgC)/3).toFixed(1)}</td>
                    <td style={{textAlign:'right'}}>{Math.max(bs.peakA,bs.peakB,bs.peakC).toFixed(1)}</td>
                    <td style={{textAlign:'right'}}>—</td>
                    <td style={{textAlign:'right'}}>100%</td>
                  </tr>
                </tbody>
              </table>
              <div className="abox" style={{background:'#eff6ff',border:'1px solid #bfdbfe',color:'#1e40af'}}>
                {L(`Overall avg current: ${((bs.avgA+bs.avgB+bs.avgC)/3).toFixed(1)}A. Worst phase deviation: ${Math.max(...[bs.avgA,bs.avgB,bs.avgC].map((a,_,arr)=>{const avg=arr.reduce((s,v)=>s+v,0)/3;return avg>0?Math.abs((a-avg)/avg)*100:0})).toFixed(2)}%. Target deviation < 5%.`,
                   `กระแสเฉลี่ยรวม ${((bs.avgA+bs.avgB+bs.avgC)/3).toFixed(1)}A ความเบี่ยงเบนแย่สุด: ${Math.max(...[bs.avgA,bs.avgB,bs.avgC].map((a,_,arr)=>{const avg=arr.reduce((s,v)=>s+v,0)/3;return avg>0?Math.abs((a-avg)/avg)*100:0})).toFixed(2)}% เป้าหมาย < 5%`)}
              </div>
            </>
          ) : (
            <div style={{padding:'8px',color:'#999',fontSize:'9pt'}}>{L('No time-series data available. Static values: L1='+L1.toFixed(1)+'A, L2='+L2.toFixed(1)+'A, L3='+L3.toFixed(1)+'A','ไม่มีข้อมูล time-series ค่าคงที่: L1='+L1.toFixed(1)+'A, L2='+L2.toFixed(1)+'A, L3='+L3.toFixed(1)+'A')}</div>
          )}
        </div>

        {/* ── 9. ผลการตรวจวัด (Findings) ── */}
        <div className="sec">
          <div className="st">📋 3. {L('Findings','ผลการตรวจวัด')}</div>
          <div style={{marginBottom:8}}>
            <div style={{fontWeight:600,fontSize:'9pt',color:'#4338ca',marginBottom:5}}>3.1 {L('Measurement Overview','ภาพรวมการวัด')}</div>
            <div className="g3">
              {[
                {icon:'📊',label:L('Data Points','จำนวนจุดวัด'),val:bs?String(bs.rows):L('Form only','จากฟอร์มเท่านั้น')},
                {icon:'📅',label:L('Period','ช่วงเวลา'),val:data.measurementPeriod||'-'},
                {icon:'🔬',label:L('Instrument','อุปกรณ์'),val:data.equipment||'-'},
                {icon:'📍',label:L('Location','สถานที่'),val:data.location||'—'},
                {icon:'⚡',label:L('Nominal Voltage','แรงดันพิกัด'),val:`${nomV} V`},
                {icon:'〰️',label:L('Frequency','ความถี่'),val:`${data.frequency} Hz`},
              ].map(s => (
                <div key={s.label} style={{background:'#eef2ff',borderRadius:5,padding:'6px 8px',border:'1px solid #c7d2fe'}}>
                  <div style={{fontSize:'8pt',color:'#6366f1',marginBottom:2}}>{s.icon} {s.label}</div>
                  <div style={{fontSize:'9pt',fontWeight:600,color:'#3730a3',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
          {bs && (
            <div>
              <div style={{fontWeight:600,fontSize:'9pt',color:'#4338ca',marginBottom:5}}>3.2 {L('Hourly Load Profile','โปรไฟล์โหลดรายชั่วโมง')}</div>
              {renderHourlyBars()}
              <div className="abox" style={{background:'#eef2ff',border:'1px solid #c7d2fe',color:'#3730a3',marginTop:4}}>
                {bs.peakHour&&L(`Peak hour: ${bs.peakHour.h}:00 (${bs.peakHour.avg.toFixed(2)} kW). Base hour: ${bs.baseHour?bs.baseHour.h+':00 ('+bs.baseHour.avg.toFixed(2)+' kW)':'-'}.`,
                               `ชั่วโมงสูงสุด: ${bs.peakHour.h}:00 (${bs.peakHour.avg.toFixed(2)} kW) โหลดฐาน: ${bs.baseHour?bs.baseHour.h+':00 ('+bs.baseHour.avg.toFixed(2)+' kW)':'-'}`)}
              </div>
            </div>
          )}
        </div>

        {/* ── 10. Executive Summary ── */}
        <div className="execbox">
          <div style={{fontWeight:700,fontSize:'11pt',marginBottom:6}}>4. {L('Executive Summary','สรุปผู้บริหาร')}</div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
            <span style={{fontSize:'16pt'}}>{recs.filter(r=>r.priority==='high').length===0?'✅':'⚠️'}</span>
            <span style={{fontWeight:700,fontSize:'10pt'}}>{recs.filter(r=>r.priority==='high').length===0?L('System in Good Condition','ระบบอยู่ในสภาพดี'):L(`${recs.filter(r=>r.priority==='high').length} critical issue(s) detected`,`พบปัญหาวิกฤต ${recs.filter(r=>r.priority==='high').length} รายการ`)}</span>
          </div>
          <div className="g3" style={{gap:6}}>
            {[
              {label:L('Load Factor','Load Factor'),val:bs?`${bs.lf.toFixed(1)}%`:'N/A',ok:bs?bs.lf>=60:true,desc:L('Target ≥ 60%','เป้าหมาย ≥ 60%')},
              {label:L('Power Factor','Power Factor'),val:pf.toFixed(2),ok:pf>=0.85,desc:L('Target ≥ 0.95','เป้าหมาย ≥ 0.95')},
              {label:L('Current Imbalance','ความไม่สมดุล'),val:`${nemaImb.toFixed(2)}%`,ok:nemaImb<5,desc:L('Target < 5% (IEC)','เป้าหมาย < 5%')},
            ].map(m => (
              <div key={m.label} style={{background:'rgba(255,255,255,0.15)',borderRadius:6,padding:'6px 8px',textAlign:'center'}}>
                <div style={{fontSize:'8pt',opacity:0.8,marginBottom:2}}>{m.label}</div>
                <div style={{fontSize:'14pt',fontWeight:700,color:m.ok?'#86efac':'#fca5a5'}}>{m.val}</div>
                <div style={{fontSize:'7pt',opacity:0.7}}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 11. Peak Analysis ── */}
        {bs && (
          <div className="sec">
            <div className="st">📊 5. {L('Peak Analysis','การวิเคราะห์ค่าสูงสุด')}</div>
            <div className="g4">
              {[
                {label:L('Peak Demand','ความต้องการสูงสุด'),val:`${bs.peakKw.toFixed(2)} kW`,bg:'#fef2f2',bc:'#fca5a5',c:'#dc2626'},
                {label:L('Overall Average','ค่าเฉลี่ยรวม'),val:`${bs.avgKw.toFixed(2)} kW`,bg:'#f0fdf4',bc:'#86efac',c:'#16a34a'},
                {label:L('Peak / Avg Ratio','อัตราส่วน Peak/Avg'),val:`${bs.peakKw>0?(bs.peakKw/bs.avgKw).toFixed(2):'—'}×`,bg:'#fffbeb',bc:'#fde68a',c:'#d97706'},
                {label:L('Night Base Load','โหลดฐานกลางคืน'),val:`${bs.nightKw.toFixed(2)} kW`,bg:'#f0f9ff',bc:'#bae6fd',c:'#0369a1'},
              ].map(x => (
                <div key={x.label} className="mbox" style={{background:x.bg,border:`1px solid ${x.bc}`}}>
                  <div className="ml" style={{color:x.c}}>{x.label}</div>
                  <div className="mv" style={{color:x.c,fontSize:'11pt'}}>{x.val}</div>
                </div>
              ))}
            </div>
            <div className="abox" style={{background:'#fff7ed',border:'1px solid #fed7aa',color:'#9a3412'}}>
              {L(`Peak-to-average ratio ${bs.peakKw>0?(bs.peakKw/bs.avgKw).toFixed(2):'N/A'}×. ${bs.peakKw/bs.avgKw>1.5?'High ratio suggests peak-shaving potential.':'Ratio is acceptable.'}`,
                 `Peak/Avg = ${bs.peakKw>0?(bs.peakKw/bs.avgKw).toFixed(2):'N/A'}× ${bs.peakKw/bs.avgKw>1.5?'อัตราส่วนสูง แนะนำให้ตัด Peak':'อัตราส่วนอยู่ในระดับยอมรับได้'}`)}
            </div>
          </div>
        )}

        {/* ── 12. Three-Phase Imbalance ── */}
        <div className="sec">
          <div className="st">⚖️ 6. {L('Three-Phase Imbalance Analysis','การวิเคราะห์ความไม่สมดุลสามเฟส')}</div>
          <div className="g3">
            {[
              {label:L('NEMA Imbalance','ความไม่สมดุล NEMA'),val:`${nemaImb.toFixed(2)}%`,ok:nemaImb<5,bg:'#f8fafc',bc:'#e2e8f0',c:'#1e293b'},
              {label:L('Per-Interval Avg (IEC)','เฉลี่ยต่อช่วง (IEC)'),val:bs?`${bs.avgImb.toFixed(2)}%`:'—',ok:bs?bs.avgImb<5:true,bg:'#f8fafc',bc:'#e2e8f0',c:'#1e293b'},
              {label:L('Worst-Case (Peak)','แย่สุด (สูงสุด)'),val:bs?`${bs.maxImb.toFixed(2)}%`:'—',ok:bs?bs.maxImb<5:true,bg:'#f8fafc',bc:'#e2e8f0',c:'#1e293b'},
            ].map(x => (
              <div key={x.label} className="mbox" style={{background:x.ok?'#f0fdf4':'#fef2f2',border:`1px solid ${x.ok?'#86efac':'#fca5a5'}`}}>
                <div className="ml" style={{color:x.ok?'#15803d':'#dc2626'}}>{x.label}</div>
                <div className="mv" style={{color:x.ok?'#166534':'#9f1239',fontSize:'12pt'}}>{x.val}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:6}}><span className="badge" style={{background:iecImb.bg,color:iecImb.c,border:`1px solid ${iecImb.b}`,padding:'3px 10px'}}>{iecImb.t}</span></div>
          {bs && (
            <table className="tbl" style={{marginTop:8}}>
              <thead><tr><th>{L('Phase','เฟส')}</th><th style={{textAlign:'right'}}>{L('Avg (A)','เฉลี่ย (A)')}</th><th style={{textAlign:'right'}}>{L('Dev from 3Φ Avg','เบี่ยงเบนจากเฉลี่ย')}</th><th style={{textAlign:'center'}}>{L('Status','สถานะ')}</th></tr></thead>
              <tbody>
                {[{l:'L1',a:bs.avgA},{l:'L2',a:bs.avgB},{l:'L3',a:bs.avgC}].map(ph => {
                  const overall3=(bs.avgA+bs.avgB+bs.avgC)/3
                  const dev=overall3>0?((ph.a-overall3)/overall3)*100:0
                  const ok=Math.abs(dev)<5
                  return (
                    <tr key={ph.l}>
                      <td style={{fontWeight:600}}>{ph.l}</td>
                      <td style={{textAlign:'right'}}>{ph.a.toFixed(1)} A</td>
                      <td style={{textAlign:'right'}}><span style={{color:dev>=0?'#d97706':'#2563eb',fontWeight:600}}>{dev>=0?'+':''}{dev.toFixed(2)}%</span></td>
                      <td style={{textAlign:'center'}}><span className="badge" style={{background:ok?'#f0fdf4':'#fef2f2',color:ok?'#16a34a':'#dc2626'}}>{ok?'✓ Pass':'✗ Fail'}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── 13. NEMA Imbalance ── */}
        <div className="sec">
          <div className="st">🔢 7. {L('Current Imbalance (NEMA Method)','ความไม่สมดุลกระแส (วิธี NEMA)')}</div>
          <div className="g3">
            {[
              {label:'NEMA MG1 Imbalance',val:`${nemaImb.toFixed(2)}%`,sub:nemaImb<5?L('Excellent','ดีเยี่ยม'):nemaImb<10?L('Acceptable','พอใช้ได้'):L('Poor','ไม่ดี')},
              {label:L('Per-Interval IEC Avg','เฉลี่ย IEC 60034-26'),val:bs?`${bs.avgImb.toFixed(2)}%`:'N/A',sub:bs?(bs.avgImb<5?'< 5% ✓':'≥ 5% ⚠'):'—'},
              {label:L('Motor Derating Factor','ค่าลดทอนมอเตอร์'),val:`${Math.max(0,Math.round(100-nemaImb*4))}%`,sub:nemaImb<5?L('No derating','ไม่ลดทอน'):L('Derating applied','ต้องลดกำลัง')},
            ].map(x => (
              <div key={x.label} className="mbox" style={{background:'#f8fafc',border:'1px solid #e2e8f0'}}>
                <div className="ml" style={{color:'#475569'}}>{x.label}</div>
                <div className="mv" style={{color:'#1e293b',fontSize:'12pt'}}>{x.val}</div>
                <div style={{fontSize:'7.5pt',color:'#64748b',marginTop:2}}>{x.sub}</div>
              </div>
            ))}
          </div>
          <div className="abox" style={{background:'#f0f9ff',border:'1px solid #bae6fd',color:'#0369a1'}}>
            {L(`NEMA MG1 formula: (Max deviation from avg) / avg × 100. For ${nemaImb.toFixed(2)}%: motor derating ≈ ${Math.max(0,100-nemaImb*4).toFixed(0)}%. Target below 5% for full motor performance.`,
               `สูตร NEMA MG1: (เบี่ยงเบนสูงสุดจากค่าเฉลี่ย) / ค่าเฉลี่ย × 100 = ${nemaImb.toFixed(2)}% ค่าลดทอนมอเตอร์ ≈ ${Math.max(0,100-nemaImb*4).toFixed(0)}% ควรต่ำกว่า 5%`)}
          </div>
        </div>

        {/* ── 14. Energy Estimation ── */}
        {bs && (
          <div className="sec">
            <div className="st">💡 8. {L('Energy Estimation & Load Factor','การประเมินพลังงาน (kWh) และ Load Factor')}</div>
            <div className="g4">
              {[
                {label:L('Daily Energy','พลังงานต่อวัน'),val:`${bs.dailyKwh.toFixed(1)} kWh`,bg:'#eff6ff',bc:'#bfdbfe',c:'#1d4ed8'},
                {label:L('Monthly Energy','พลังงานต่อเดือน'),val:`${bs.monthKwh.toFixed(0)} kWh`,bg:'#f0fdf4',bc:'#bbf7d0',c:'#15803d'},
                {label:L('Monthly Bill (Est.)','ค่าไฟ/เดือน (ประมาณ)'),val:`฿${(bs.monthKwh*4.18).toFixed(0)}`,bg:'#fefce8',bc:'#fde68a',c:'#a16207'},
                {label:L('Load Factor','Load Factor'),val:`${bs.lf.toFixed(1)}%`,bg:bs.lf>=60?'#f0fdf4':'#fef2f2',bc:bs.lf>=60?'#86efac':'#fca5a5',c:bs.lf>=60?'#166534':'#9f1239'},
              ].map(x => (
                <div key={x.label} className="mbox" style={{background:x.bg,border:`1px solid ${x.bc}`}}>
                  <div className="ml" style={{color:x.c}}>{x.label}</div>
                  <div className="mv" style={{color:x.c,fontSize:'11pt'}}>{x.val}</div>
                </div>
              ))}
            </div>
            <div className="abox" style={{background:'#fefce8',border:'1px solid #fde68a',color:'#713f12',marginTop:6}}>
              {L(`Coverage: ${bs.coverageH.toFixed(1)}h, Energy: ${bs.energyKwh.toFixed(1)} kWh, Avg Power: ${bs.avgKw.toFixed(2)} kW. Load Factor = avg/peak = ${bs.peakKw>0?(bs.avgKw/bs.peakKw*100).toFixed(1):'N/A'}%.`,
                 `ระยะเวลา: ${bs.coverageH.toFixed(1)}ชม., พลังงาน: ${bs.energyKwh.toFixed(1)} kWh, กำลังเฉลี่ย: ${bs.avgKw.toFixed(2)} kW. Load Factor = เฉลี่ย/สูงสุด = ${bs.peakKw>0?(bs.avgKw/bs.peakKw*100).toFixed(1):'N/A'}%`)}
            </div>
          </div>
        )}

        {/* ── 15. Advanced Analysis ── */}
        <div className="sec">
          <div className="st">🧪 9. {L('Advanced Analysis','การวิเคราะห์เชิงลึก')}</div>
          <div className="g3">
            <div className="mbox" style={{background:'#f0f9ff',border:'1px solid #bae6fd'}}>
              <div className="ml" style={{color:'#0369a1'}}>{L('Power Quality Score','คะแนนคุณภาพไฟฟ้า')}</div>
              <div className="mv" style={{color:'#0c4a6e',fontSize:'18pt'}}>{qScore}</div>
              <div style={{fontSize:'10pt',fontWeight:700,color:qScore>=80?'#16a34a':qScore>=65?'#d97706':'#dc2626'}}>Grade {qGrade}</div>
            </div>
            <div className="mbox" style={{background:thd<=5?'#f0fdf4':thd<=8?'#fffbeb':'#fef2f2',border:`1px solid ${thd<=5?'#86efac':thd<=8?'#fde68a':'#fca5a5'}`}}>
              <div className="ml" style={{color:thdBadge.c}}>THD (%)</div>
              <div className="mv" style={{color:thdBadge.c,fontSize:'16pt'}}>{thd.toFixed(1)}%</div>
              <div style={{fontSize:'8pt',color:thdBadge.c,fontWeight:600}}>{thdBadge.t}</div>
            </div>
            <div className="mbox" style={{background:'#fefce8',border:'1px solid #fde68a'}}>
              <div className="ml" style={{color:'#a16207'}}>{L('KSAVER Recommendation','แนะนำ KSAVER')}</div>
              <div className="mv" style={{color:'#92400e',fontSize:'11pt'}}>{ksaverModel}</div>
              <div style={{fontSize:'8pt',color:'#a16207'}}>{ksaverKva.toFixed(1)} kVA</div>
            </div>
          </div>
          <div style={{marginTop:6,fontSize:'8.5pt',color:'#666'}}>
            {L('Score formula: PF(40%) + Imbalance(30%) + THD(20%) + LoadFactor(10%). Max 100.','สูตรคะแนน: PF(40%) + ความไม่สมดุล(30%) + THD(20%) + LoadFactor(10%) คะแนนสูงสุด 100')}
          </div>
        </div>

        {/* ── 16. Power Analysis ── */}
        <div className="sec">
          <div className="st">🔌 10. {L('Quantified Power Analysis','การวิเคราะห์กำลังไฟฟ้าเชิงปริมาณ')}</div>
          <div className="g4">
            {[
              {label:`S (${L('Apparent','ปรากฏ')})`,val:`${S.toFixed(2)} kVA`,bg:'#f5f3ff',bc:'#ddd6fe',c:'#5b21b6'},
              {label:`P (${L('Active','จริง')})`,val:`${P.toFixed(2)} kW`,bg:'#eff6ff',bc:'#bfdbfe',c:'#1d4ed8'},
              {label:`Q (${L('Reactive','รีแอกทีฟ')})`,val:`${Q.toFixed(2)} kVAR`,bg:'#f0fdf4',bc:'#bbf7d0',c:'#15803d'},
              {label:L('Capacitor (to PF 0.95)','Capacitor (เป้า PF 0.95)'),val:`${capKvar.toFixed(1)} kVAR`,bg:'#fff7ed',bc:'#fed7aa',c:'#c2410c'},
            ].map(x => (
              <div key={x.label} className="mbox" style={{background:x.bg,border:`1px solid ${x.bc}`}}>
                <div className="ml" style={{color:x.c}}>{x.label}</div>
                <div className="mv" style={{color:x.c,fontSize:'11pt'}}>{x.val}</div>
              </div>
            ))}
          </div>
          <div className="abox" style={{background:'#f5f3ff',border:'1px solid #ddd6fe',color:'#4c1d95',marginTop:6}}>
            {L(`S = √3 × ${nomV}V × ${avg3.toFixed(1)}A = ${S.toFixed(2)} kVA | P = S × PF${pf.toFixed(2)} = ${P.toFixed(2)} kW | Q = √(S²−P²) = ${Q.toFixed(2)} kVAR | Capacitor needed: ${capKvar.toFixed(1)} kVAR`,
               `S = √3 × ${nomV}V × ${avg3.toFixed(1)}A = ${S.toFixed(2)} kVA | P = S × PF${pf.toFixed(2)} = ${P.toFixed(2)} kW | Q = √(S²−P²) = ${Q.toFixed(2)} kVAR | Capacitor: ${capKvar.toFixed(1)} kVAR`)}
          </div>
        </div>

        {/* ── 17. Technical Interpretation ── */}
        <div className="sec">
          <div className="st">🔍 11. {L('Technical Interpretation','การตีความผลทางเทคนิค')}</div>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            {[
              {ok:pf>=0.85,warn:pf>=0.85&&pf<0.95,label:L('Power Factor','Power Factor'),val:`PF = ${pf.toFixed(2)}`,detail:pf>=0.95?L('✓ Excellent (≥ 0.95)','✓ ดีเยี่ยม (≥ 0.95)'):pf>=0.85?L('⚠ Fair (0.85-0.95). Improvement recommended.','⚠ ปานกลาง (0.85-0.95) ควรปรับปรุง'):L('✗ Poor (< 0.85). Immediate correction required.','✗ ต่ำมาก (< 0.85) ต้องแก้ไขด่วน')},
              {ok:nemaImb<5,warn:nemaImb>=5&&nemaImb<10,label:L('Current Imbalance','ความไม่สมดุลกระแส'),val:`${nemaImb.toFixed(2)}%`,detail:nemaImb<5?L('✓ Pass. Within IEC 60034-26 (< 5%).','✓ ผ่าน ต่ำกว่า IEC 60034-26 (< 5%)'):nemaImb<10?L('⚠ Warning (5-10%). Monitor and redistribute loads.','⚠ เตือน (5-10%) ควรกระจายโหลด'):L('✗ Fail (> 10%). Immediate load redistribution required.','✗ ไม่ผ่าน (> 10%) ต้องปรับสมดุลโหลดด่วน')},
              ...(thd>0?[{ok:thd<=5,warn:thd>5&&thd<=8,label:'THD',val:`${thd.toFixed(1)}%`,detail:thd<=5?L('✓ Pass. IEEE 519 compliant (≤ 5%).','✓ ผ่าน IEEE 519 (≤ 5%)'):thd<=8?L('⚠ Elevated. Consider harmonic filter.','⚠ สูงขึ้น พิจารณา Harmonic Filter'):L('✗ High THD. Harmonic filter required.','✗ THD สูงมาก ต้องติดตั้ง Harmonic Filter')}]:[]),
              ...(bs?[{ok:bs.lf>=60,warn:bs.lf>=40&&bs.lf<60,label:'Load Factor',val:`${bs.lf.toFixed(1)}%`,detail:bs.lf>=60?L('✓ Good load utilization (≥ 60%).','✓ ประสิทธิภาพการใช้โหลดดี (≥ 60%)'):bs.lf>=40?L('⚠ Moderate. Opportunity to improve scheduling.','⚠ ปานกลาง ควรปรับตารางการใช้งาน'):L('✗ Low load factor. Significant improvement potential.','✗ Load Factor ต่ำ มีโอกาสปรับปรุงมาก')}]:[]),
            ].map((item, _i) => (
              <div key={_i} style={{display:'flex',gap:8,padding:'6px 8px',borderRadius:5,borderLeft:`3px solid ${item.ok&&!item.warn?'#22c55e':item.warn?'#f59e0b':'#ef4444'}`,background:item.ok&&!item.warn?'#f0fdf4':item.warn?'#fffbeb':'#fef2f2'}}>
                <div style={{width:90,fontWeight:600,fontSize:'8.5pt',flexShrink:0,color:'#555'}}>{item.label}<br/><span style={{fontWeight:700,fontSize:'9.5pt',color:'#222'}}>{item.val}</span></div>
                <div style={{flex:1,fontSize:'9pt',color:'#444',lineHeight:1.5}}>{item.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 18. Recommendations ── */}
        <div className="sec">
          <div className="st">📌 12. {L('Recommendations','ข้อเสนอแนะ')}</div>
          {recs.map((r,i) => (
            <div key={i} className={`rbox ${r.priority==='high'?'hl':r.priority==='medium'?'ml-r':'ll'}`}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:6,marginBottom:2}}>
                <span style={{fontWeight:700,fontSize:'9.5pt',color:'#1f2937'}}>{r.title}</span>
                <span className="badge" style={{background:r.priority==='high'?'#fee2e2':r.priority==='medium'?'#fef3c7':'#dbeafe',color:r.priority==='high'?'#dc2626':r.priority==='medium'?'#d97706':'#2563eb',fontSize:'7.5pt',flexShrink:0}}>
                  {r.priority==='high'?'🔴 '+L('High','สูง'):r.priority==='medium'?'🟡 '+L('Medium','กลาง'):'🔵 '+L('Advisory','แนะนำ')}
                </span>
              </div>
              <div style={{fontSize:'9pt',color:'#4b5563'}}>{r.action}</div>
            </div>
          ))}
          <div className="abox" style={{background:'#f0f9ff',border:'1px solid #bae6fd',color:'#0369a1',marginTop:4}}>
            {L(`PF=${pf.toFixed(2)}, Imbalance=${nemaImb.toFixed(1)}%, THD=${thd.toFixed(1)}%, ${bs?'LF='+bs.lf.toFixed(1)+'%':'LF=N/A'}. Recommendations auto-prioritized by impact.`,
               `PF=${pf.toFixed(2)}, ความไม่สมดุล=${nemaImb.toFixed(1)}%, THD=${thd.toFixed(1)}%, ${bs?'LF='+bs.lf.toFixed(1)+'%':'LF=ไม่มีข้อมูล'} ข้อเสนอแนะจัดลำดับตามผลกระทบอัตโนมัติ`)}
          </div>
        </div>

        {/* ── Engineer Approval ── */}
        <div className="sec">
          <div className="st">👤 {L('Engineer Certification & Approval','การรับรองและอนุมัติโดยวิศวกร')}</div>
          <div className="g2" style={{marginBottom:10}}>
            <div>
              <div className="ir"><span className="il">{L('Engineer:','วิศวกร:')}</span><span className="iv" style={{fontWeight:600}}>{data.engineerName||'-'}</span></div>
              <div className="ir"><span className="il">{L('License:','เลขใบอนุญาต:')}</span><span className="iv">{data.engineerLicense||'-'}</span></div>
            </div>
            <div>
              <div className="ir"><span className="il">{L('Approver:','ผู้อนุมัติ:')}</span><span className="iv" style={{fontWeight:600}}>{data.approverName||'-'}</span></div>
              <div className="ir"><span className="il">{L('Approval Date:','วันที่อนุมัติ:')}</span><span className="iv">{data.approvalDate||'-'}</span></div>
              <div className="ir"><span className="il">{L('Status:','สถานะ:')}</span>
                <span><span className="badge" style={{background:data.approvalStatus==='Approved'?'#f0fdf4':data.approvalStatus==='Rejected'?'#fef2f2':'#fffbeb',color:approvalColor,fontSize:'8.5pt',fontWeight:700}}>
                  {data.approvalStatus==='Approved'?'✅':data.approvalStatus==='Rejected'?'❌':'⏳'} {data.approvalStatus}
                </span></span>
              </div>
            </div>
          </div>
          <div className="srow">
            <div className="sbox">
              <div className="sline">{data.engineerName&&<span style={{fontSize:'9pt',fontWeight:600,color:'#2563eb'}}>{data.engineerName}</span>}</div>
              <div className="sname">{L('Engineer / Certifier','วิศวกร / ผู้รับรอง')}</div>
              {data.engineerLicense&&<div className="ssub">{data.engineerLicense}</div>}
            </div>
            <div className="sbox">
              <div className="sline">{data.approverName&&<span style={{fontSize:'9pt',fontWeight:600,color:'#16a34a'}}>{data.approverName}</span>}</div>
              <div className="sname">{L('Approver','ผู้อนุมัติ')}</div>
              {data.approvalDate&&<div className="ssub">{data.approvalDate}</div>}
            </div>
            <div className="sbox">
              <div className="sline"></div>
              <div className="sname">{L('Customer','ลูกค้า')}</div>
              <div className="ssub">{L('Site Owner','เจ้าของสถานที่')}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="foot">
          <span>{L('Doc:','เลขที่:')} {data.id}</span>
          <span>{L('Printed:','พิมพ์เมื่อ:')} {new Date().toLocaleString(lang==='th'?'th-TH':'en-US')}</span>
          <span>{L('K Energy Save Co., Ltd.','บริษัท เค อีเนอร์ยี่ เซฟ จำกัด')}</span>
        </div>
      </div>
    </>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{padding:20,textAlign:'center'}}>Loading...</div>}>
      <PrintContent />
    </Suspense>
  )
}
