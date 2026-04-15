"use client"
import React, { useCallback, useEffect, useState } from 'react'
import AccWindow,{useLang} from '../../components/AccWindow'
type ExpenseCategory = { id?: number; code?: string; name_th?: string; name_en?: string; acc_code?: string }
const emptyForm: ExpenseCategory = { code: '', name_th: '', name_en: '', acc_code: '' }

const th: React.CSSProperties = { padding:'8px 14px',background:'#4b5563',color:'#fff',fontSize:13,fontWeight:600,textAlign:'left',whiteSpace:'nowrap',borderBottom:'1px solid #d1d5db' }
const td: React.CSSProperties = { padding:'7px 14px',borderBottom:'1px solid #e5e7eb',fontSize:13.5 }
const inp: React.CSSProperties = { width:'100%',padding:'7px 12px',border:'1px solid #d1d5db',borderRadius:8,background:'#fff',fontSize:13.5,boxSizing:'border-box',fontFamily:'"Sarabun","Tahoma",sans-serif',outline:'none' }
const btn = (bg:string,c='#1f2937'): React.CSSProperties => ({padding:'7px 18px',background:bg==='#f3f4f6'?'#f3f4f6':bg,color:c,border:'1px solid #d1d5db',borderRadius:8,fontSize:13.5,fontWeight:600,cursor:'pointer',fontFamily:'"Sarabun","Tahoma",sans-serif',transition:'all 0.2s'})
export default function ExpenseCatPage(){
  const{L}=useLang()
  const[data,setData]=useState<ExpenseCategory[]>([]);const[form,setForm]=useState<ExpenseCategory>(emptyForm);const[showForm,setShowForm]=useState(false)
  const[loading,setLoading]=useState(false);const[search,setSearch]=useState('');const[msg,setMsg]=useState('')
  const load = useCallback(async (q = '') => {
    const r = await fetch('/api/accounting/expense-categories' + (q ? '?q=' + encodeURIComponent(q) : ''))
    const d = await r.json()
    if (d.ok) setData((d.data || []) as ExpenseCategory[])
  }, [])
  useEffect(() => { void load('') }, [load])
  const save=async()=>{setLoading(true);setMsg('');const m=form.id?'PUT':'POST';const r=await fetch('/api/accounting/expense-categories',{method:m,headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});const d=await r.json();if(d.ok){setShowForm(false);setForm(emptyForm);void load(search);setMsg(L('Saved','บันทึกสำเร็จ'))}else setMsg('Error: '+d.error);setLoading(false)}
  const del=async(id:number)=>{if(!confirm(L('Delete?','ลบ?')))return;await fetch('/api/accounting/expense-categories?id='+id,{method:'DELETE'});void load(search)}
  const handleDelete = (id?: number) => { if (typeof id === 'number') void del(id) }
  return(<AccWindow title={L('Expense Categories','รายละเอียดค่าใช้จ่ายอื่นๆ')}><div style={{padding:12}}>
    <div style={{display:'flex',gap:6,marginBottom:8,alignItems:'center',flexWrap:'wrap'}}>
      <button style={btn('#f3f4f6')} onClick={()=>{setForm(emptyForm);setShowForm(true)}}>+ {L('New','เพิ่มใหม่')}</button>
      <input style={{...inp,width:200}} placeholder={L('Search...','ค้นหา...')} value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&void load(search)} />
      <button style={btn('#f3f4f6')} onClick={() => void load(search)}>{L('Search','ค้นหา')}</button>
      {msg&&<span style={{color:msg.startsWith('E')?'red':'green',fontSize:13}}>{msg}</span>}
    </div>
    <div style={{overflowX:'auto',border:'1px solid #d1d5db',borderRadius:12,overflow:'hidden',boxShadow:'0 2px 6px rgba(0,0,0,0.08)'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr>{[L('Code','รหัส'),L('Name (TH)','ชื่อ (ไทย)'),L('Name (EN)','ชื่อ (อังกฤษ)'),L('Account','บัญชี'),''].map((h,i)=><th key={i} style={th}>{h}</th>)}</tr></thead>
      <tbody>{data.length===0&&<tr><td colSpan={5} style={{...td,textAlign:'center',color:'#888',padding:20}}>{L('No data','ไม่มีข้อมูล')}</td></tr>}
        {data.map((r,i)=>(<tr key={r.id ?? i} style={{background:i%2?'#f5f5f5':'#fff'}}>
          <td style={td}>{r.code}</td><td style={td}>{r.name_th}</td><td style={td}>{r.name_en}</td><td style={td}>{r.acc_code}</td>
          <td style={{...td,whiteSpace:'nowrap'}}><button style={{...btn('#f3f4f6'),marginRight:3}} onClick={()=>{setForm({...r});setShowForm(true)}}>{L('Edit','แก้ไข')}</button><button style={btn('#f3f4f6','#dc2626')} onClick={() => handleDelete(r.id)}>{L('Del','ลบ')}</button></td>
        </tr>))}</tbody></table></div>
    {showForm&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',border:'1px solid #d1d5db',borderRadius:12,boxShadow:'0 20px 60px rgba(0,0,0,0.3)',minWidth:420,maxWidth:520,width:'95%'}}>
        <div style={{background:'linear-gradient(135deg,#374151 0%,#4b5563 100%)',padding:'3px 8px',color:'#fff',fontSize:13,fontWeight:700,display:'flex',justifyContent:'space-between'}}>
          <span>{form.id?L('Edit','แก้ไข'):L('New','เพิ่มใหม่')}</span><span style={{cursor:'pointer'}} onClick={()=>setShowForm(false)}>✕</span></div>
        <div style={{padding:16,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 12px'}}>
            <div><div style={{fontSize:12,marginBottom:2}}>{L('Code','รหัส')}</div><input style={inp} value={form.code||''} onChange={e=>setForm(f2=>({...f2,code:e.target.value}))} /></div>
              <div><div style={{fontSize:12,marginBottom:2}}>{L('Name (TH)','ชื่อ (ไทย)')}</div><input style={inp} value={form.name_th||''} onChange={e=>setForm(f2=>({...f2,name_th:e.target.value}))} /></div>
              <div><div style={{fontSize:12,marginBottom:2}}>{L('Name (EN)','ชื่อ (อังกฤษ)')}</div><input style={inp} value={form.name_en||''} onChange={e=>setForm(f2=>({...f2,name_en:e.target.value}))} /></div>
              <div><div style={{fontSize:12,marginBottom:2}}>{L('Account','บัญชี')}</div><input style={inp} value={form.acc_code||''} onChange={e=>setForm(f2=>({...f2,acc_code:e.target.value}))} /></div>
        </div>
        <div style={{padding:'8px 16px 12px',display:'flex',gap:8,justifyContent:'flex-end',borderTop:'1px solid #999'}}>
          <button style={btn('#f3f4f6')} onClick={()=>setShowForm(false)}>{L('Cancel','ยกเลิก')}</button>
          <button style={btn('#f3f4f6','#4b5563')} disabled={loading} onClick={save}>{loading?'...':L('Save','บันทึก')}</button>
        </div></div></div>}
  </div></AccWindow>)
}