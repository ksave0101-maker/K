"use client"

import React, { useEffect, useState, Suspense } from 'react'
import PrintStyles from '../../components/PrintStyles'
import { useSearchParams } from 'next/navigation'

function PreInstallationPrintPageContent() {
  const searchParams = useSearchParams()
  const formID = searchParams?.get('formID') || searchParams?.get('preInstallID') || searchParams?.get('id') || ''
  const auto = searchParams?.get('autoPrint')
  const [form, setForm] = useState<any | null>(null)
  const [loggedUser, setLoggedUser] = useState<string | null>(null)
  const [printCount, setPrintCount] = useState<number>(0)
  const [lastPrinted, setLastPrinted] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const paramLangInit = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('lang') : null
  const [selectedLang, setSelectedLang] = useState<'en'|'th'>(() => {
    if (paramLangInit === 'en') return 'en'
    if (paramLangInit === 'th') return 'th'
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      return l === 'en' ? 'en' : 'th'
    } catch { return 'th' }
  })

  useEffect(() => {
    if (!formID) return
    ;(async () => {
      setLoading(true); setError(null)
      try {
        const res = await fetch(`/api/pre-installation?id=${encodeURIComponent(formID)}`)
        const j = await res.json()
        if (res.ok && j?.success) setForm(j.form)
        else setError(j?.message || 'Not found')
      } catch (err: any) { setError(String(err)) }
      finally { setLoading(false) }
    })()
  }, [formID])

  useEffect(() => {
    const html = document.documentElement; const body = document.body
    html.style.height = 'auto'; html.style.overflowY = 'auto'
    body.style.height = 'auto'; body.style.overflowY = 'auto'
    return () => { html.style.height=''; html.style.overflowY=''; body.style.height=''; body.style.overflowY='' }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) { const u = JSON.parse(raw); setLoggedUser(u?.name||u?.fullname||u?.username||'') }
    } catch {}
    const key = `print_count:pre_install:${formID||'unknown'}`
    setPrintCount(parseInt(localStorage.getItem(key)||'0',10)||0)
    setLastPrinted(localStorage.getItem(key+':last')||null)
    const onAfter = () => {
      try {
        const n = (parseInt(localStorage.getItem(key)||'0',10)||0)+1
        const ts = new Date().toISOString()
        localStorage.setItem(key,String(n)); localStorage.setItem(key+':last',ts)
        setPrintCount(n); setLastPrinted(ts)
      } catch {}
    }
    ;(window as any).onafterprint = onAfter
    return () => { try { (window as any).onafterprint=null } catch {} }
  }, [formID])

  useEffect(() => {
    if (form && (auto==='1'||auto==='true'))
      setTimeout(()=>{ try { window.print() } catch {} },300)
  }, [form, auto])

  if (!formID) return <div style={{padding:20}}>Missing formID</div>
  if (loading) return <div style={{padding:20}}>Loading...</div>
  if (error)   return <div style={{padding:20,color:'red'}}>{error}</div>
  if (!form)   return <div style={{padding:20}}>Form not found</div>

  const updateQS = (uri:string,key:string,value:string) => {
    try { const u=new URL(uri); u.searchParams.set(key,value); return u.toString() } catch { return uri }
  }

  const L = (en:string,th:string) => selectedLang==='th' ? th : en

  let cl:any = {}
  try { cl = typeof form.checklist==='string' ? JSON.parse(form.checklist) : (form.checklist||{}) } catch {}

  const photos = Array.isArray(form.photos) ? form.photos :
    (typeof form.photos==='string' ? (()=>{ try{return JSON.parse(form.photos)}catch{return[]} })() : [])

  const sc   = cl.siteClassification||{}
  const bi   = cl.basicInfo||{}
  const pd   = cl.phaseData||{}
  const ha   = cl.harmonicAnalysis||{}
  const vd   = cl.voltageDrop||''
  const cond = cl.conditions||{}
  const li   = cl.loadInspection||{}
  const lp   = cl.loadProfile||{}
  const sn   = cl.specialNotes||{}
  const eco  = cl.economic||{}
  const es   = cl.equipmentSizing||{}

  const val = (v:any) => (v!==undefined&&v!==null&&v!=='') ? String(v) : '-'
  const chk = (v:boolean) => v ? '☑' : '☐'
  const pct = (v:any) => v ? `${v} %` : '-'
  const unit = (v:any,u:string) => v ? `${v} ${u}` : '-'

  /* ── Style helpers ── */
  const tbl: React.CSSProperties = { width:'100%', borderCollapse:'collapse', marginBottom:0, fontSize:'9pt', lineHeight:1.35 }
  const TH  = (x?:React.CSSProperties):React.CSSProperties => ({ border:'1px solid #255899', padding:'5px 8px', background:'#dbeafe', fontWeight:700, textAlign:'left', ...x })
  const TG  = (x?:React.CSSProperties):React.CSSProperties => ({ border:'1px solid #2e7d32', padding:'5px 8px', background:'#dcfce7', fontWeight:700, textAlign:'left', ...x })
  const TD  = (x?:React.CSSProperties):React.CSSProperties => ({ border:'1px solid #255899', padding:'5px 8px', ...x })
  const TDG = (x?:React.CSSProperties):React.CSSProperties => ({ border:'1px solid #2e7d32', padding:'5px 8px', ...x })
  const LBL = (x?:React.CSSProperties):React.CSSProperties => ({ border:'1px solid #255899', padding:'5px 8px', background:'#fefce8', fontWeight:600, verticalAlign:'middle', ...x })
  const LBG = (x?:React.CSSProperties):React.CSSProperties => ({ border:'1px solid #2e7d32', padding:'5px 8px', background:'#fefce8', fontWeight:600, verticalAlign:'middle', ...x })

  const SecHead = ({num,en,th:t,green}:{num?:string;en:string;th:string;green?:boolean}) => (
    <div style={{
      background: green ? 'linear-gradient(135deg,#14532d,#166534)' : 'linear-gradient(135deg,#1e3a5f,#1e64af)',
      color:'#fff', padding:'5px 12px', fontWeight:700, fontSize:'9.5pt', lineHeight:1.3,
      breakAfter:'avoid', pageBreakAfter:'avoid'
    }}>
      {num ? `■ ${num}. ` : '■ '}{L(en,t)}
    </div>
  )

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 1.4cm 2cm 1.4cm 2cm; }
        @media print {
          .no-print { display: none !important; }
          body { margin:0; padding:0; }
          .a4-wrap { box-shadow:none !important; margin:0 !important; width:100% !important; max-width:none !important; padding:0 !important; }
        }
        @media screen { html,body { height:auto!important; overflow-y:auto!important; background:#ccc; } }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { display:none; }
        html { -ms-overflow-style:none; scrollbar-width:none; }
        .a4-wrap {
          width:100%; max-width:174mm; margin:10mm auto; padding:0;
          background:#fff; font-family:'Sarabun','Segoe UI',sans-serif;
          font-size:9pt; line-height:1.35; color:#1a1a1a;
          box-shadow:0 2px 10px rgba(0,0,0,0.2);
        }
        .page-body { padding:10mm 12mm; }
        .sec { margin-bottom:9px; }
        .sec-head-wrap { break-after:avoid; page-break-after:avoid; }
        table { break-inside:auto; }
        tr { break-inside:avoid; page-break-inside:avoid; }
        td, th { vertical-align:middle; }
      `}</style>
      <PrintStyles />

      {/* Toolbar */}
      <div className="no-print" style={{textAlign:'center',padding:'10px',background:'#f3f4f6',borderBottom:'1px solid #ddd'}}>
        {(['th','en'] as const).map(lng=>(
          <button key={lng}
            onClick={()=>{ setSelectedLang(lng); window.history.replaceState(null,'',updateQS(window.location.href,'lang',lng)) }}
            style={{marginRight:6,padding:'5px 16px',fontSize:13,borderRadius:20,
              border:selectedLang===lng?'2px solid #1e64af':'1px solid #ccc',
              background:selectedLang===lng?'#dbeafe':'#fff',
              cursor:'pointer',fontWeight:selectedLang===lng?700:400}}>
            {lng==='th'?'ไทย':'English'}
          </button>
        ))}
        <button onClick={()=>window.print()}
          style={{marginLeft:12,padding:'5px 20px',fontSize:13,borderRadius:20,
            border:'none',background:'#1e64af',color:'#fff',cursor:'pointer',fontWeight:700}}>
          {L('Print','พิมพ์')}
        </button>
      </div>

      <div className="a4-wrap">
        <div className="page-body">

          {/* ══ HEADER ══ */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',
            borderBottom:'2.5px solid #1e3a5f',marginBottom:10,paddingBottom:8}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <img src="/k-energy-save-logo.jpg" alt="Logo"
                style={{width:76,height:76,objectFit:'contain'}}
                onError={e=>(e.currentTarget.style.display='none')} />
              <div>
                <div style={{fontSize:'13pt',fontWeight:800,color:'#1e3a5f'}}>
                  {L('K Energy Save Co., Ltd.','บริษัท เค อีเนอร์ยี่ เซฟ จำกัด')}
                </div>
                <div style={{fontSize:'8pt',color:'#666',marginTop:3,lineHeight:1.5}}>
                  84 Chaloem Phrakiat Rama 9 Soi 34, Nong Bon, Prawet, Bangkok 10250<br/>
                  Tel: 02-080-8916 | Email: info@kenergy-save.com
                </div>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:'14pt',fontWeight:800,color:'#1e3a5f'}}>
                {L('PRE-INSTALLATION REPORT','รายงานก่อนการติดตั้ง')}
              </div>
              <div style={{fontSize:'9pt',color:'#555'}}>{L('Site Survey Checklist','แบบฟอร์มตรวจสอบหน้างาน')}</div>
              <div style={{fontSize:'8.5pt',color:'#333',marginTop:4,fontWeight:700}}>
                {L('No:','เลขที่:')} {form.pre_install_no||form['Pre-installNo']||'-'}
              </div>
            </div>
          </div>

          {/* ══ CUSTOMER INFO ══ */}
          <div style={{display:'flex',gap:10,marginBottom:10}}>
            <div style={{flex:1,border:'1px solid #ddd',borderRadius:4,padding:'7px 10px',background:'#fafafa'}}>
              <div style={{fontWeight:700,fontSize:'8.5pt',color:'#1e3a5f',borderBottom:'1px solid #ddd',marginBottom:5,paddingBottom:3}}>
                {L('Document Info','ข้อมูลเอกสาร')}
              </div>
              {[
                [L('Form ID:','รหัส:'), <strong key="a">{form.formID||'-'}</strong>],
                [L('Status:','สถานะ:'), <span key="b" style={{color:form.status==='completed'?'#16a34a':'#dc2626'}}>{form.status||'pending'}</span>],
                [L('Created By:','สร้างโดย:'), form.created_by||'-'],
                [L('Date:','วันที่:'), form.created_at ? new Date(form.created_at).toLocaleDateString(selectedLang==='th'?'th-TH':'en-US',{year:'numeric',month:'long',day:'numeric'}) : '-'],
              ].map(([l,v],i)=>(
                <div key={i} style={{display:'flex',marginBottom:3,fontSize:'9pt'}}>
                  <span style={{width:90,fontWeight:600,color:'#555',flexShrink:0}}>{l}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
            <div style={{flex:2,border:'1px solid #ddd',borderRadius:4,padding:'7px 10px',background:'#fafafa'}}>
              <div style={{fontWeight:700,fontSize:'8.5pt',color:'#1e3a5f',borderBottom:'1px solid #ddd',marginBottom:5,paddingBottom:3}}>
                {L('Customer & Site Information','ข้อมูลลูกค้า / สถานที่')}
              </div>
              {[
                [L('Customer:','ลูกค้า:'), <strong key="c">{form.customer_name||'-'}</strong>],
                [L('Phone:','โทร:'), form.customer_phone||form.contact_phone||'-'],
                [L('Site Address:','ที่อยู่สถานที่:'), form.site_address||'-'],
              ].map(([l,v],i)=>(
                <div key={i} style={{display:'flex',marginBottom:3,fontSize:'9pt'}}>
                  <span style={{width:110,fontWeight:600,color:'#555',flexShrink:0}}>{l}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ══ SECTION 1 ══ */}
          <div className="sec">
            <div className="sec-head-wrap"><SecHead num="1" en="Site Classification" th="การจำแนกประเภทสถานที่" /></div>
            <table style={tbl}>
              <tbody>
                <tr>
                  <td style={LBL({width:'36%'})}>{L('Facility Type','ประเภทสถานที่')}</td>
                  <td style={TD()}>{val(sc.facilityType)}{sc.facilityType==='Other'&&sc.facilityTypeOther?` – ${sc.facilityTypeOther}`:''}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Operating Hours Pattern','รูปแบบชั่วโมงทำงาน')}</td>
                  <td style={TD()}>{val(sc.operatingHoursPattern)}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Power Factor Characteristic','ลักษณะ Power Factor')}</td>
                  <td style={TD()}>{val(sc.powerFactorCharacteristic)}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Harmonic Characteristic','ลักษณะ Harmonic')}</td>
                  <td style={TD()}>{val(sc.harmonicCharacteristic)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ══ SECTION 2 ══ */}
          <div className="sec">
            <div className="sec-head-wrap"><SecHead num="2" en="Power Source Analysis" th="การวิเคราะห์แหล่งจ่ายไฟ" /></div>
            <table style={tbl}>
              <thead>
                <tr>
                  <th style={TH({width:'36%'})}>{L('Item','รายการ')}</th>
                  <th style={TH({width:'32%'})}>{L('Value','ค่า')}</th>
                  <th style={TH()}>{L('Note','หมายเหตุ')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={LBL()}>{L('Main Breaker','เมนเบรกเกอร์')}</td>
                  <td style={TD()}>{unit(bi.mainBreaker?.value,'A')}</td>
                  <td style={TD()}>{bi.mainBreaker?.note||'-'}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Transformer Capacity','ขนาดหม้อแปลง')}</td>
                  <td style={TD()}>{unit(bi.transformerCapacity,'kVA')}</td>
                  <td style={TD()}></td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Peak Power','กำลังสูงสุด')}</td>
                  <td style={TD()}>{unit(bi.peakPower?.value,'kW')}</td>
                  <td style={TD()}></td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Phase System','ระบบเฟส')}</td>
                  <td style={TD()}>{val(bi.phaseType?.value)}</td>
                  <td style={TD()}>{val(bi.phaseType?.voltage)}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Connection Method','วิธีการต่อไฟ')}</td>
                  <td style={TD()}>{val(bi.faucetMethod)}</td>
                  <td style={TD()}></td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Cable Size','ขนาดสายไฟ')}</td>
                  <td style={TD()}>{val(bi.cableSize)}</td>
                  <td style={TD()}></td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Installation Location','ตำแหน่งติดตั้ง')}</td>
                  <td style={TD()} colSpan={2}>{val(bi.installationLocation)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ══ SECTION 3 ══ */}
          <div className="sec">
            <div className="sec-head-wrap"><SecHead num="3" en="Load Analysis" th="การวิเคราะห์โหลด" /></div>
            <table style={tbl}>
              <thead>
                <tr>
                  <th style={TH({width:'22%'})}>{L('Load Type','ประเภทโหลด')}</th>
                  <th style={TH({width:'30%'})}>{L('Equipment','อุปกรณ์')}</th>
                  <th style={TH({width:'18%',textAlign:'center'})}>{L('Proportion (%)','สัดส่วน (%)')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={LBL({background:'#fef9c3'})} rowSpan={2}>{L('Resistive Load','โหลดต้านทาน')}</td>
                  <td style={TD()}>{L('Heaters','เครื่องทำความร้อน')}</td>
                  <td style={TD({textAlign:'center'})}>{pct(li.resistiveHeaters)}</td>
                </tr>
                <tr>
                  <td style={TD()}>{L('Incandescent / Fluorescent Lamps','หลอดไฟ')}</td>
                  <td style={TD({textAlign:'center'})}>{pct(li.resistiveLamps)}</td>
                </tr>
                <tr>
                  <td style={LBL({background:'#fef3c7'})} rowSpan={4}>{L('Inductive Load','โหลดเหนี่ยวนำ')}</td>
                  <td style={TD()}>{L('Motors','มอเตอร์')}</td>
                  <td style={TD({textAlign:'center'})}>{pct(li.inductiveMotors)}</td>
                </tr>
                <tr>
                  <td style={TD()}>{L('Pumps','ปั๊ม')}</td>
                  <td style={TD({textAlign:'center'})}>{pct(li.inductivePumps)}</td>
                </tr>
                <tr>
                  <td style={TD()}>{L('Air Conditioners','เครื่องปรับอากาศ')}</td>
                  <td style={TD({textAlign:'center'})}>{pct(li.inductiveAC)}</td>
                </tr>
                <tr>
                  <td style={TD()}>{L('Compressors','คอมเพรสเซอร์')}</td>
                  <td style={TD({textAlign:'center'})}>{pct(li.inductiveCompressors)}</td>
                </tr>
                <tr>
                  <td style={LBL({background:'#fce7f3'})} rowSpan={4}>{L('Non-linear Load','โหลดไม่เชิงเส้น')}</td>
                  <td style={TD()}>{L('Inverters','อินเวอร์เตอร์')}</td>
                  <td style={TD({textAlign:'center'})}>{pct(li.nonLinearInverters)}</td>
                </tr>
                <tr>
                  <td style={TD()}>VFDs</td>
                  <td style={TD({textAlign:'center'})}>{pct(li.nonLinearVFDs)}</td>
                </tr>
                <tr>
                  <td style={TD()}>UPS</td>
                  <td style={TD({textAlign:'center'})}>{pct(li.nonLinearUPS)}</td>
                </tr>
                <tr>
                  <td style={TD()}>SMPS</td>
                  <td style={TD({textAlign:'center'})}>{pct(li.nonLinearSMPS)}</td>
                </tr>
                <tr>
                  <td style={LBL()} colSpan={2}>{L('Type & Proportion Summary','สรุปประเภทและสัดส่วน')}</td>
                  <td style={TD()}>{val(li.typeAndProportion)}</td>
                </tr>
                <tr>
                  <td style={LBL()} colSpan={2}>{L('Products Manufactured','ประเภทผลิตภัณฑ์')}</td>
                  <td style={TD()}>{val(li.producedProducts)}</td>
                </tr>
                <tr>
                  <td style={LBL()} colSpan={2}>{L('Inverter / AVR Usage','การใช้ Inverter/AVR')}</td>
                  <td style={TD()}>{val(li.inverterAvrUsed)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ══ SECTION 4 ══ */}
          <div className="sec">
            <div className="sec-head-wrap"><SecHead num="4" en="Electrical Parameter Measurement" th="การวัดค่าพารามิเตอร์ไฟฟ้า" /></div>
            <table style={tbl}>
              <thead>
                <tr>
                  <th style={TH({width:'9%'})}>{L('Phase','เฟส')}</th>
                  <th style={TH({textAlign:'center'})}>{L('V Line-Line','V เส้น-เส้น')}</th>
                  <th style={TH({textAlign:'center'})}>PF</th>
                  <th style={TH({textAlign:'center',fontSize:'8pt'})}>{L('Phase-Neutral','เฟส-นิวทรัล')}</th>
                  <th style={TH({textAlign:'center'})}>{L('V Phase-N','V เฟส-N')}</th>
                  <th style={TH({textAlign:'center',background:'#bbf7d0'})}>{L('Current (A)','กระแส (A)')}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {lbl:'R-S',k:'rs',pn:'L1Φ-N'},
                  {lbl:'S-T',k:'st',pn:'L2Φ-N'},
                  {lbl:'T-R',k:'tr',pn:'L3Φ-N'},
                ].map(row=>{
                  const p = pd[row.k]||{}
                  return (
                    <tr key={row.k}>
                      <td style={LBL({textAlign:'center',fontWeight:700})}>{row.lbl}</td>
                      <td style={TD({textAlign:'center'})}>{val(p.voltage)}</td>
                      <td style={TD({textAlign:'center'})}>{val(p.pf)}</td>
                      <td style={TD({textAlign:'center',color:'#1d4ed8',fontSize:'8pt'})}>{row.pn}</td>
                      <td style={TD({textAlign:'center'})}>{val(p.voltageN)}</td>
                      <td style={TD({textAlign:'center',background:'#f0fdf4',fontWeight:700,color:'#166534'})}>
                        {p.current?`${p.current} A`:'-'}
                      </td>
                    </tr>
                  )
                })}
                <tr>
                  <td style={LBL()} colSpan={3}>{L('Voltage Drop / Fluctuation','แรงดันตก / กระเพื่อม')}</td>
                  <td style={TD()} colSpan={3}>{val(vd)}</td>
                </tr>
                <tr>
                  <td style={LBL()} colSpan={3}>{L('Harmonic Analysis (THD %)','การวิเคราะห์ฮาร์โมนิก (THD %)')}</td>
                  <td style={TD()} colSpan={3}>
                    {ha.thdValue?`THD: ${ha.thdValue}%`:''}{ha.thdValue&&ha.notes?' — ':''}{val(ha.notes)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ══ SECTION 5 ══ */}
          <div className="sec">
            <div className="sec-head-wrap"><SecHead num="5" en="Load Profile Analysis" th="การวิเคราะห์โปรไฟล์โหลด" /></div>
            <table style={tbl}>
              <tbody>
                <tr>
                  <td style={LBL({width:'36%'})}>{L('Operating Pattern','รูปแบบการใช้งาน')}</td>
                  <td style={TD()}>{val(lp.operatingPattern)}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Peak Load Periods','ช่วงโหลดสูงสุด')}</td>
                  <td style={TD()}>{val(lp.peakLoadPeriods)}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Measurement Tool','เครื่องมือวัด')}</td>
                  <td style={TD()}>{val(lp.measurementTool)}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Recording Period','ช่วงเวลาบันทึก')}</td>
                  <td style={TD()}>{val(lp.recordingPeriod)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ══ SECTION 6 ══ */}
          <div className="sec">
            <div className="sec-head-wrap"><SecHead num="6" en="Installation Area Assessment" th="การประเมินพื้นที่ติดตั้ง" /></div>
            <table style={tbl}>
              <tbody>
                <tr>
                  <td style={LBL({width:'36%'})}>{L('Site Space / Clearance','พื้นที่ / ระยะห่าง')}</td>
                  <td style={TD()}>{val(cond.installationSite?.note)}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Cable Direction','ทิศทางสายเคเบิล')}</td>
                  <td style={TD()}>
                    {chk(cond.cableDirection?.bottomLeft)} {L('Bottom Left','ซ้ายล่าง')}&nbsp;&nbsp;
                    {chk(cond.cableDirection?.topLeft)} {L('Top Left','ซ้ายบน')}&nbsp;&nbsp;
                    {chk(cond.cableDirection?.bottomRight)} {L('Bottom Right','ขวาล่าง')}&nbsp;&nbsp;
                    {chk(cond.cableDirection?.topRight)} {L('Top Right','ขวาบน')}
                  </td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Additional Works','งานเพิ่มเติม')}</td>
                  <td style={TD()}>
                    {chk(cond.cableTrayWork?.checked)} {L('Cable Tray','รางสาย')}&nbsp;&nbsp;
                    {chk(cond.circuitBreakerPanel?.checked)} {L('CB Panel','ตู้เบรก')}&nbsp;&nbsp;
                    {chk(cond.busbarFabrication?.checked)} {L('Busbar','บัสบาร์')}&nbsp;&nbsp;
                    {chk(cond.craneArrangement?.checked)} {L('Crane','เครน')}&nbsp;&nbsp;
                    {chk(cond.forkliftArrangement?.checked)} {L('Forklift','โฟล์คลิฟท์')}
                  </td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Temperature','อุณหภูมิ')}</td>
                  <td style={TD()}>{val(cond.temperature)}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Humidity','ความชื้น')}</td>
                  <td style={TD()}>{val(cond.humidity)}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Dust Level','ระดับฝุ่น')}</td>
                  <td style={TD()}>{val(cond.dustLevel)}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Water / Moisture Exposure','การสัมผัสน้ำ/ความชื้น')}</td>
                  <td style={TD()}>{val(cond.waterExposure)}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Vibration','การสั่นสะเทือน')}</td>
                  <td style={TD()}>{val(cond.vibration)}</td>
                </tr>
                {cond.other?.note && (
                  <tr>
                    <td style={LBL()}>{L('Other','อื่นๆ')}</td>
                    <td style={TD()}>{cond.other.note}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ══ SECTION 7 ══ */}
          <div className="sec">
            <div className="sec-head-wrap"><SecHead num="7" en="Economic Feasibility Analysis" th="การวิเคราะห์ความเป็นไปได้ทางเศรษฐกิจ" /></div>
            <table style={tbl}>
              <thead>
                <tr>
                  <th style={TH({width:'36%'})}>{L('Item','รายการ')}</th>
                  <th style={TH()}>{L('Value','ค่า')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={LBL()}>{L('Average Load','โหลดเฉลี่ย')}</td>
                  <td style={TD()}>{unit(eco.averageLoad,'kW')}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Operating Hours','ชั่วโมงทำงาน')}</td>
                  <td style={TD()}>{eco.operatingHours?`${eco.operatingHours} ${L('hrs/month','ชม./เดือน')}`:'-'}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Monthly Electricity Cost','ค่าไฟฟ้ารายเดือน')}</td>
                  <td style={TD()}>{eco.monthlyElectricityCost?`${eco.monthlyElectricityCost} ${L('Baht/month','บาท/เดือน')}`:'-'}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Energy Losses','การสูญเสียพลังงาน')}</td>
                  <td style={TD()}>{pct(eco.energyLoss)}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Estimated Energy Savings','การประหยัดพลังงานที่คาดว่าได้')}</td>
                  <td style={TD()}>{pct(eco.estimatedSavingsPct)}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Estimated Payback Period','ระยะเวลาคืนทุน')}</td>
                  <td style={TD()}>{eco.paybackPeriod?`${eco.paybackPeriod} ${L('months','เดือน')}`:'-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ══ SPECIAL NOTES ══ */}
          <div className="sec">
            <div className="sec-head-wrap"><SecHead en="Special Notes" th="หมายเหตุพิเศษ" /></div>
            <table style={tbl}>
              <tbody>
                <tr>
                  <td style={LBL({width:'36%'})}>{L('Key Considerations','ข้อพิจารณาสำคัญ')}</td>
                  <td style={TD({whiteSpace:'pre-wrap',minHeight:36})}>{val(sn.siteConsiderations)}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Daily Usage / Monthly Frequency','การใช้งานรายวัน/รายเดือน')}</td>
                  <td style={TD()}>{val(sn.usageFrequency)}</td>
                </tr>
                <tr>
                  <td style={LBL()}>{L('Maximum Current Under Load','กระแสสูงสุดภายใต้โหลด')}</td>
                  <td style={TD()}>{val(sn.maxCurrentUnderLoad)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ══ SECTION 8 ══ */}
          <div className="sec">
            <div className="sec-head-wrap"><SecHead num="8" en="Equipment Sizing Summary (K-Saver Selection)" th="สรุปการเลือกขนาดอุปกรณ์ (K-Saver)" green /></div>
            <table style={{...tbl, border:'2px solid #166534'}}>
              <thead>
                <tr>
                  <th style={TG({width:'36%'})}>{L('Parameter','พารามิเตอร์')}</th>
                  <th style={TG()}>{L('Value','ค่า')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={LBG()}>{L('Actual Load Percentage','เปอร์เซ็นต์โหลดจริง')}</td>
                  <td style={TDG()}>{pct(es.actualLoadPercent)}</td>
                </tr>
                <tr>
                  <td style={LBG()}>{L('Operating Current','กระแสใช้งาน')}</td>
                  <td style={TDG()}>{unit(es.operatingCurrent,'A')}</td>
                </tr>
                <tr>
                  <td style={LBG()}>{L('Power Factor (PF)','Power Factor (PF)')}</td>
                  <td style={TDG()}>{val(es.powerFactor)}</td>
                </tr>
                <tr>
                  <td style={LBG()}>{L('Maximum Demand','ความต้องการสูงสุด')}</td>
                  <td style={TDG()}>{unit(es.maximumDemand,'kW')}</td>
                </tr>
                <tr>
                  <td style={LBG()}>{L('Average Load','โหลดเฉลี่ย')}</td>
                  <td style={TDG()}>{unit(es.averageLoad,'kW')}</td>
                </tr>
                <tr>
                  <td style={LBG()}>{L('Phase Imbalance Condition','สภาวะความไม่สมดุลเฟส')}</td>
                  <td style={TDG()}>{val(es.phaseImbalanceCondition)}</td>
                </tr>
                {/* Recommended K-Saver highlighted row */}
                <tr>
                  <td style={LBG({background:'#bbf7d0',fontSize:'10pt',fontWeight:800})}>
                    {L('Recommended K-Saver Size','ขนาด K-Saver ที่แนะนำ')}
                  </td>
                  <td style={TDG({background:'#f0fdf4',fontSize:'16pt',fontWeight:800,color:'#14532d',textAlign:'center',padding:'8px'})}>
                    {es.recommendedKSaverSize ? `${es.recommendedKSaverSize} kVA` : '-'}
                  </td>
                </tr>
                {es.sizingNotes && (
                  <tr>
                    <td style={LBG()}>{L('Sizing Notes','หมายเหตุการเลือกขนาด')}</td>
                    <td style={TDG({whiteSpace:'pre-wrap'})}>{es.sizingNotes}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Photos */}
          {photos.length > 0 && (
            <div className="sec">
              <div style={{fontWeight:700,fontSize:'9.5pt',color:'#1e3a5f',background:'#dbeafe',padding:'5px 12px',marginBottom:5}}>
                {L('Site Photos','รูปภาพหน้างาน')}
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {photos.map((p:any)=>(
                  <img key={p.id}
                    src={`/api/pre-installation/image?id=${encodeURIComponent(String(p.id))}`}
                    alt={p.filename||'photo'}
                    style={{width:100,height:72,objectFit:'cover',borderRadius:3,border:'1px solid #ddd'}} />
                ))}
              </div>
            </div>
          )}

          {/* Signature */}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:24,paddingTop:14,borderTop:'1px solid #bbb'}}>
            {[
              {en:'Surveyed By',th:'ผู้สำรวจ',sub_en:'Technician',sub_th:'ช่างเทคนิค'},
              {en:'Approved By',th:'ผู้อนุมัติ',sub_en:'Manager',sub_th:'ผู้จัดการ'},
              {en:'Customer',th:'ลูกค้า',sub_en:'Site Owner',sub_th:'เจ้าของสถานที่'},
            ].map(s=>(
              <div key={s.en} style={{width:'30%',textAlign:'center'}}>
                <div style={{borderBottom:'1px solid #333',height:38,marginBottom:5}} />
                <div style={{fontSize:'9pt',fontWeight:700}}>{L(s.en,s.th)}</div>
                <div style={{fontSize:'8.5pt',color:'#666'}}>{L(s.sub_en,s.sub_th)}</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'7.5pt',color:'#aaa',
            borderTop:'1px solid #eee',paddingTop:5,marginTop:10}}>
            <span>{L('User:','ผู้พิมพ์:')} {loggedUser||'-'}</span>
            <span>{L('Printed:','พิมพ์เมื่อ:')} {new Date(lastPrinted||new Date()).toLocaleString(selectedLang==='th'?'th-TH':'en-US')}</span>
            <span>{L('Print #:','ครั้งที่:')} {printCount+1}</span>
          </div>

        </div>{/* page-body */}
      </div>{/* a4-wrap */}
    </>
  )
}

export default function PreInstallationPrintPage() {
  return (
    <Suspense fallback={<div style={{padding:20,textAlign:'center'}}>Loading...</div>}>
      <PreInstallationPrintPageContent />
    </Suspense>
  )
}
