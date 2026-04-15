"use client"
import React, { useCallback, useEffect, useState } from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'
import SupplierSearch from '../../components/SupplierSearch'

type Row = {
  id?: number; doc_no?: string; doc_date?: string; supplier_id?: number; supplier_name?: string
  price_exempt?: number; price_before_vat?: number; vat?: number; wht_rate?: number; wht?: number
  total?: number; status?: string; note?: string; due_date?: string; po_ref?: string
  subtotal?: number; wht_amount?: number; vat_amount?: number
}
const WHT_RATES = [1, 2, 3, 5, 10, 15]
const empty: Row = {
  doc_date: new Date().toISOString().slice(0,10), supplier_name: '',
  price_exempt: 0, price_before_vat: 0, vat: 0, wht_rate: 0, wht: 0, total: 0,
  status: 'draft', note: '', due_date: ''
}
const calcTotals = (price_exempt: number, price_before_vat: number, wht_rate: number) => {
  const vat = Math.round(price_before_vat * 7) / 100
  const whtBase = price_exempt + price_before_vat
  const wht = Math.round(whtBase * wht_rate) / 100
  const total = price_exempt + price_before_vat + vat - wht
  return { vat: +vat.toFixed(2), wht: +wht.toFixed(2), total: +total.toFixed(2) }
}
const th: React.CSSProperties = { padding:'4px 8px',background:'#4b5563',color:'#fff',border:'1px solid #d1d5db',fontSize:13,textAlign:'left',whiteSpace:'nowrap' }
const td: React.CSSProperties = { padding:'3px 8px',borderBottom:'1px solid #e5e7eb',fontSize:13 }
const inp: React.CSSProperties = { width:'100%',padding:'3px 6px',border:'1px solid #d1d5db',borderRadius:8,background:'#fff',fontSize:13,boxSizing:'border-box' }
const inpRo: React.CSSProperties = { ...inp, background:'#f3f4f6', color:'#374151', fontWeight:600 }
const btn = (bg:string,c='#000'):React.CSSProperties => ({ padding:'3px 14px',background:bg,color:c,fontSize:13,cursor:'pointer',border:'1px solid #d1d5db',borderRadius:8,fontFamily:'"Sarabun","Tahoma",sans-serif' })
const fmt = (n:number) => n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
const rowStyle: React.CSSProperties = { display:'flex',justifyContent:'space-between',alignItems:'center',padding:'4px 0',borderBottom:'1px solid #f0f0f0',fontSize:13 }
const labelStyle: React.CSSProperties = { color:'#374151',minWidth:200 }
const valueStyle: React.CSSProperties = { fontWeight:600,minWidth:100,textAlign:'right' }

type PoRow = { id: number; doc_no: string; doc_date: string; supplier_id?: number; supplier_name?: string; supplier_tax_id?: string; subtotal?: number; vat_amount?: number; total?: number; note?: string; status?: string; payment_type?: string }

export default function CreditPurchasePage() {
  const { L } = useLang()
  const [data,setData] = useState<Row[]>([]); const [form,setForm] = useState<Row>(empty); const [showForm,setShowForm] = useState(false)
  const [loading,setLoading] = useState(false); const [search,setSearch] = useState(''); const [msg,setMsg] = useState(''); const [supplierDisplay,setSupplierDisplay] = useState('')
  const [showPoPicker,setShowPoPicker] = useState(false); const [poList,setPoList] = useState<PoRow[]>([]); const [poQ,setPoQ] = useState(''); const [poLoading,setPoLoading] = useState(false)

  const load = useCallback(async (q = '') => {
    const r = await fetch('/api/accounting/purchase-orders?doc_type=credit' + (q ? '&q=' + encodeURIComponent(q) : ''))
    const d = await r.json()
    if (d.ok) setData(d.data as Row[])
  }, [])

  const openPoPicker = async () => {
    setShowPoPicker(true); setPoLoading(true); setPoQ('')
    const r = await fetch('/api/accounting/purchase-orders?doc_type=po')
    const d = await r.json(); if(d.ok) setPoList(d.data||[])
    setPoLoading(false)
  }
  const searchPo = async (q: string) => {
    setPoQ(q); setPoLoading(true)
    const r = await fetch('/api/accounting/purchase-orders?doc_type=po'+(q?'&q='+encodeURIComponent(q):''))
    const d = await r.json(); if(d.ok) setPoList(d.data||[])
    setPoLoading(false)
  }
  const pickPo = (po: PoRow) => {
    const subtotal = po.subtotal || 0
    const updated = updateCalc(
      { price_before_vat: subtotal, price_exempt: 0, supplier_id: po.supplier_id, supplier_name: po.supplier_name||'' },
      { ...empty, doc_date: form.doc_date||empty.doc_date!, due_date: form.due_date||'', wht_rate: form.wht_rate||0, status: form.status||'draft' }
    )
    setForm({ ...updated, po_ref: po.doc_no })
    setSupplierDisplay(po.supplier_name||'')
    setShowPoPicker(false)
  }
  useEffect(() => { void load('') }, [load])

  const updateCalc = (patch: Partial<Row>, current: Row) => {
    const merged = { ...current, ...patch }
    const { vat, wht, total } = calcTotals(merged.price_exempt||0, merged.price_before_vat||0, merged.wht_rate||0)
    return { ...merged, vat, wht, total }
  }

  const save = async () => {
    setLoading(true); setMsg(''); const method=form.id?'PUT':'POST'
    const payload = { ...form, doc_type:'credit', subtotal:(form.price_exempt||0)+(form.price_before_vat||0) }
    const res=await fetch('/api/accounting/purchase-orders',{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
    const d=await res.json(); if(d.ok){setShowForm(false);setForm(empty);setSupplierDisplay('');void load(search);setMsg(L('Saved','บันทึกสำเร็จ'))} else setMsg('Error: '+d.error); setLoading(false)
  }
  const del = async (id:number) => { if(!confirm(L('Delete?','ลบ?'))) return; await fetch('/api/accounting/purchase-orders?id='+id,{method:'DELETE'}); void load(search) }
  const handleDelete = (id?: number) => { if (typeof id === 'number') void del(id) }

  return (
    <AccWindow title={L('Credit Purchase','ซื้อเงินเชื่อ')}>
      <div style={{padding:12}}>
        <div style={{display:'flex',gap:6,marginBottom:8,alignItems:'center',flexWrap:'wrap'}}>
          <button style={btn('#f3f4f6')} onClick={()=>{setForm(empty);setSupplierDisplay('');setShowForm(true)}}>+ {L('New','เพิ่มใหม่')}</button>
          <input style={{...inp,width:200}} placeholder={L('Search...','ค้นหา...')} value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&void load(search)} />
          <button style={btn('#f3f4f6')} onClick={() => void load(search)}>{L('Search','ค้นหา')}</button>
          {msg&&<span style={{color:msg.startsWith('Error')?'red':'green',fontSize:13}}>{msg}</span>}
        </div>
        <div style={{overflowX:'auto',border:'1px solid #d1d5db',borderRadius:12,overflow:'hidden',boxShadow:'0 2px 6px rgba(0,0,0,0.08)'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{[L('Doc No','เลขที่'),L('Date','วันที่'),L('Supplier','ผู้จำหน่าย'),L('Total','รวม'),L('Status','สถานะ'),''].map((h,i)=><th key={i} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {data.length===0&&<tr><td colSpan={6} style={{...td,textAlign:'center',color:'#888',padding:20}}>{L('No data','ไม่มีข้อมูล')}</td></tr>}
              {data.map((r,i)=>(
                <tr key={r.id} style={{background:i%2?'#f5f5f5':'#fff'}}>
                  <td style={td}>{r.doc_no}</td><td style={td}>{r.doc_date?.slice(0,10)}</td><td style={td}>{r.supplier_name}</td>
                  <td style={{...td,textAlign:'right',fontWeight:700}}>{fmt(r.total||0)}</td><td style={{...td,textAlign:'center'}}>{r.status}</td>
                  <td style={{...td,whiteSpace:'nowrap'}}>
                    <button style={{...btn('#f3f4f6'),marginRight:3}} onClick={()=>{
                      const loaded: Row = {
                        ...r,
                        price_exempt: r.price_exempt||0,
                        price_before_vat: r.price_before_vat||r.subtotal||0,
                        wht_rate: r.wht_rate||0,
                        wht: r.wht||r.wht_amount||0,
                        vat: r.vat||r.vat_amount||0
                      }
                      const { vat, wht, total } = calcTotals(loaded.price_exempt||0, loaded.price_before_vat||0, loaded.wht_rate||0)
                      setForm({...loaded, vat, wht, total})
                      setSupplierDisplay(r.supplier_name||''); setShowForm(true)
                    }}>{L('Edit','แก้ไข')}</button>
                    <button style={btn('#f3f4f6','#dc2626')} onClick={() => handleDelete(r.id)}>{L('Del','ลบ')}</button>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>

        {showForm&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',overflowY:'auto',padding:'12px 0'}}>
          <div style={{background:'#fff',border:'1px solid #d1d5db',borderRadius:12,boxShadow:'0 20px 60px rgba(0,0,0,0.3)',width:'95%',maxWidth:580}}>
            {/* Header */}
            <div style={{background:'linear-gradient(135deg,#374151 0%,#4b5563 100%)',padding:'6px 12px',color:'#fff',fontSize:14,fontWeight:700,display:'flex',justifyContent:'space-between',alignItems:'center',borderRadius:'12px 12px 0 0'}}>
              <span>{form.id?L('Edit Credit Purchase','แก้ไข ซื้อเงินเชื่อ'):L('New Credit Purchase','ซื้อเงินเชื่อ')}</span>
              <span style={{cursor:'pointer',fontSize:16,lineHeight:1}} onClick={()=>setShowForm(false)}>✕</span>
            </div>
            {/* Body */}
            <div style={{padding:16}}>
              {/* Date + Due Date */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 12px',marginBottom:10}}>
                <div>
                  <div style={{fontSize:12,marginBottom:2,color:'#6b7280'}}>{L('Date','วันที่')}</div>
                  <input style={inp} type="date" value={form.doc_date||''} onChange={e=>setForm(f=>({...f,doc_date:e.target.value}))} />
                </div>
                <div>
                  <div style={{fontSize:12,marginBottom:2,color:'#6b7280'}}>{L('Due Date','วันครบกำหนด')}</div>
                  <input style={inp} type="date" value={form.due_date||''} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} />
                </div>
              </div>
              {/* Supplier */}
              <div style={{marginBottom:10}}>
                <div style={{fontSize:12,marginBottom:2,color:'#6b7280'}}>{L('Supplier','ผู้จำหน่าย')}</div>
                <SupplierSearch value={form.supplier_id} displayValue={supplierDisplay||form.supplier_name||''} onChange={s=>{
                  if(s){setForm(f=>({...f,supplier_id:s.id,supplier_name:s.name_th}));setSupplierDisplay(s.name_th)}
                  else{setForm(f=>({...f,supplier_id:undefined,supplier_name:''}));setSupplierDisplay('')}
                }}/>
              </div>
              {/* Divider */}
              <div style={{borderTop:'1px solid #e5e7eb',marginBottom:8}}/>
              {/* Price fields */}
              <div style={{marginBottom:8}}>
                <div style={{...rowStyle}}>
                  <span style={labelStyle}>{L('Price (tax-exempt goods)','ราคาสินค้ายกเว้นภาษี')}</span>
                  <input style={{...inp,width:130,textAlign:'right'}} type="number" min="0" step="0.01"
                    value={form.price_exempt||''}
                    onChange={e=>setForm(f=>updateCalc({price_exempt:+e.target.value||0},f))} />
                </div>
                <div style={{...rowStyle}}>
                  <span style={labelStyle}>{L('Price (before VAT)','ราคาสินค้าก่อนมูลค่าภาษี')}</span>
                  <input style={{...inp,width:130,textAlign:'right'}} type="number" min="0" step="0.01"
                    value={form.price_before_vat||''}
                    onChange={e=>setForm(f=>updateCalc({price_before_vat:+e.target.value||0},f))} />
                </div>
                <div style={{...rowStyle}}>
                  <span style={labelStyle}>{L('VAT 7%','ภาษีมูลค่าเพิ่ม 7%')}</span>
                  <input style={{...inpRo,width:130,textAlign:'right'}} readOnly value={fmt(form.vat||0)} />
                </div>
                {/* WHT row */}
                <div style={{...rowStyle}}>
                  <span style={labelStyle}>{L('Withholding Tax','หัก ณ ที่จ่าย')} &nbsp;
                    <span style={{display:'inline-flex',gap:3,flexWrap:'wrap'}}>
                      {WHT_RATES.map(r=>(
                        <button key={r} onClick={()=>setForm(f=>updateCalc({wht_rate:form.wht_rate===r?0:r},f))}
                          style={{...btn(form.wht_rate===r?'#374151':'#f3f4f6',form.wht_rate===r?'#fff':'#374151'),padding:'1px 6px',fontSize:11,borderRadius:6}}>
                          {r}%
                        </button>
                      ))}
                    </span>
                  </span>
                  <input style={{...inpRo,width:130,textAlign:'right'}} readOnly value={fmt(form.wht||0)} />
                </div>
                {/* Total */}
                <div style={{...rowStyle,borderTop:'2px solid #374151',marginTop:4,paddingTop:6}}>
                  <span style={{...labelStyle,fontWeight:700,fontSize:14}}>{L('Total','รวม')}</span>
                  <span style={{...valueStyle,fontSize:15,color:'#1d4ed8'}}>{fmt(form.total||0)}</span>
                </div>
              </div>
              {/* Divider */}
              <div style={{borderTop:'1px solid #e5e7eb',marginBottom:8}}/>
              {/* Status + Note */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 12px'}}>
                <div>
                  <div style={{fontSize:12,marginBottom:2,color:'#6b7280'}}>{L('Status','สถานะ')}</div>
                  <select style={inp} value={form.status||'draft'} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                    <option value="draft">{L('Draft','ร่าง')}</option>
                    <option value="approved">{L('Approved','อนุมัติ')}</option>
                    <option value="paid">{L('Paid','ชำระแล้ว')}</option>
                  </select>
                </div>
                <div>
                  <div style={{fontSize:12,marginBottom:2,color:'#6b7280'}}>{L('Note','หมายเหตุ')}</div>
                  <input style={inp} value={form.note||''} onChange={e=>setForm(f=>({...f,note:e.target.value}))} />
                </div>
              </div>
            </div>
            {/* Footer */}
            <div style={{padding:'8px 16px 12px',display:'flex',gap:8,justifyContent:'space-between',alignItems:'center',borderTop:'1px solid #e5e7eb',flexWrap:'wrap'}}>
              <button style={{...btn('#e0f2fe','#0369a1'),fontWeight:600}} onClick={openPoPicker}>📋 {L('Import PO','เพิ่มข้อมูล ดึงบิล PO')}</button>
              <div style={{display:'flex',gap:8}}>
                <button style={btn('#f3f4f6')} onClick={()=>setShowForm(false)}>{L('Cancel','ยกเลิก')}</button>
                <button style={btn('#374151','#fff')} disabled={loading} onClick={save}>{loading?'...':L('Save','บันทึก')}</button>
              </div>
            </div>
          </div>
        </div>}
        {/* PO Picker Modal */}
        {showPoPicker&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:3000,display:'flex',alignItems:'center',justifyContent:'center',padding:'12px 0'}}>
          <div style={{background:'#fff',borderRadius:12,boxShadow:'0 20px 60px rgba(0,0,0,0.3)',width:'95%',maxWidth:620}}>
            <div style={{background:'linear-gradient(135deg,#1e40af 0%,#3b82f6 100%)',padding:'6px 12px',color:'#fff',fontSize:14,fontWeight:700,display:'flex',justifyContent:'space-between',alignItems:'center',borderRadius:'12px 12px 0 0'}}>
              <span>📋 {L('Select PO to import','เลือกบิล PO มากรอก')}</span>
              <span style={{cursor:'pointer',fontSize:16}} onClick={()=>setShowPoPicker(false)}>✕</span>
            </div>
            <div style={{padding:12}}>
              <div style={{display:'flex',gap:6,marginBottom:8}}>
                <input style={{...inp,flex:1}} placeholder={L('Search PO no. or supplier...','ค้นหาเลขที่ PO หรือผู้จำหน่าย...')} value={poQ} onChange={e=>searchPo(e.target.value)} />
              </div>
              <div style={{maxHeight:340,overflowY:'auto',border:'1px solid #d1d5db',borderRadius:8}}>
                {poLoading&&<div style={{padding:20,textAlign:'center',color:'#888',fontSize:13}}>⏳ {L('Loading...','กำลังโหลด...')}</div>}
                {!poLoading&&poList.length===0&&<div style={{padding:20,textAlign:'center',color:'#888',fontSize:13}}>{L('No PO found','ไม่พบบิล PO ในฐานข้อมูล')}</div>}
                {!poLoading&&poList.map((p,i)=>(
                  <div key={p.id} onClick={()=>pickPo(p)}
                    style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',borderBottom:'1px solid #f0f0f0',background:i%2?'#f9fafb':'#fff',cursor:'pointer',transition:'background 0.1s'}}
                    onMouseEnter={e=>(e.currentTarget.style.background='#eff6ff')}
                    onMouseLeave={e=>(e.currentTarget.style.background=i%2?'#f9fafb':'#fff')}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13,color:'#1d4ed8'}}>{p.doc_no}</div>
                      <div style={{fontSize:12,color:'#4b5563',marginTop:1}}>{p.supplier_name||'-'}</div>
                      {p.supplier_tax_id&&<div style={{fontSize:11,color:'#9ca3af'}}>เลขภาษี: {p.supplier_tax_id}</div>}
                      <div style={{fontSize:11,color:'#9ca3af'}}>{p.doc_date?.slice(0,10)} &nbsp;·&nbsp; {L('Status','สถานะ')}: {p.status}</div>
                    </div>
                    <div style={{textAlign:'right',minWidth:90}}>
                      <div style={{fontWeight:700,fontSize:13,color:'#059669'}}>{fmt(p.subtotal||0)}</div>
                      <div style={{fontSize:11,color:'#6b7280'}}>{L('Total','รวม')}: {fmt(p.total||0)}</div>
                      <div style={{fontSize:11,color:'#3b82f6',marginTop:2}}>← {L('Select','เลือก')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>}
      </div>
    </AccWindow>
  )
}
