"use client"
import React,{useCallback,useEffect,useState} from 'react'
import AccWindow,{useLang} from '../../components/AccWindow'
interface PaymentVoucher {
  id?: number
  doc_no: string
  doc_date: string
  description: string
  amount: number
  method: string
  status: string
}

const createEmptyForm = (): PaymentVoucher => ({
  doc_no:'',
  doc_date:new Date().toISOString().slice(0,10),
  description:'',
  amount:0,
  method:'',
  status:'',
})

const th:React.CSSProperties={padding:'8px 14px',background:'#4b5563',color:'#fff',fontSize:13,fontWeight:600,textAlign:'left',whiteSpace:'nowrap',borderBottom:'1px solid #d1d5db'}
const td:React.CSSProperties={padding:'7px 14px',borderBottom:'1px solid #e5e7eb',fontSize:13.5}
const inp:React.CSSProperties={width:'100%',padding:'7px 12px',border:'1px solid #d1d5db',borderRadius:8,background:'#fff',fontSize:13.5,boxSizing:'border-box',fontFamily:'"Sarabun","Tahoma",sans-serif',outline:'none'}
const btn=(bg:string,c='#1f2937'):React.CSSProperties=>({padding:'7px 18px',background:bg==='#f3f4f6'?'#f3f4f6':bg,color:c,border:'1px solid #d1d5db',borderRadius:8,fontSize:13.5,fontWeight:600,cursor:'pointer',fontFamily:'"Sarabun","Tahoma",sans-serif',transition:'all 0.2s'})
const fmt=(n:number)=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
export default function PayOtherPage(){
  const{L}=useLang()
  const[data,setData]=useState<PaymentVoucher[]>([]);const[form,setForm]=useState<PaymentVoucher>(createEmptyForm);const[showForm,setShowForm]=useState(false)
  const[loading,setLoading]=useState(false);const[search,setSearch]=useState('');const[msg,setMsg]=useState('')
  const load=useCallback(async()=>{const r=await fetch('/api/accounting/payment-vouchers'+"?voucher_type=pay&party_type=other"+(search?'&q='+encodeURIComponent(search):''));const d=await r.json();if(d.ok)setData((d.data||[]) as PaymentVoucher[])},[search])
  useEffect(()=>{void load()},[load])
  const save=async()=>{setLoading(true);setMsg('');const m=form.id?'PUT':'POST';const r=await fetch('/api/accounting/payment-vouchers',{method:m,headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});const d=await r.json();if(d.ok){setShowForm(false);setForm(createEmptyForm());await load();setMsg(L('Saved','บันทึกสำเร็จ'))}else setMsg('Error: '+d.error);setLoading(false)}
  const del=async(id:number)=>{if(!confirm(L('Delete?','ลบ?')))return;await fetch('/api/accounting/payment-vouchers?id='+id,{method:'DELETE'});load()}
  return(<AccWindow title={L('Other Payments','จ่ายเงินอื่นๆ')}><div style={{padding:12}}>
    <div style={{display:'flex',gap:6,marginBottom:8,alignItems:'center',flexWrap:'wrap'}}>
      <button style={btn('#f3f4f6')} onClick={()=>{setForm(createEmptyForm());setShowForm(true)}}>+ {L('New','เพิ่มใหม่')}</button>
      <input style={{...inp,width:200}} placeholder={L('Search...','ค้นหา...')} value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&void load()} />
      <button style={btn('#f3f4f6')} onClick={load}>{L('Search','ค้นหา')}</button>
      {msg&&<span style={{color:msg.startsWith('E')?'red':'green',fontSize:13}}>{msg}</span>}
    </div>
    <div style={{overflowX:'auto',border:'1px solid #d1d5db',borderRadius:12,overflow:'hidden',boxShadow:'0 2px 6px rgba(0,0,0,0.08)'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr>{[L('Doc No','เลขที่'),L('Date','วันที่'),L('Description','รายละเอียด'),L('Amount','จำนวนเงิน'),L('Method','วิธี'),L('Status','สถานะ'),''].map((h,i)=><th key={i} style={th}>{h}</th>)}</tr></thead>
      <tbody>{data.length===0&&<tr><td colSpan={7} style={{...td,textAlign:'center',color:'#888',padding:20}}>{L('No data','ไม่มีข้อมูล')}</td></tr>}
        {data.map((r,i)=>(<tr key={r.id} style={{background:i%2?'#f5f5f5':'#fff'}}>
          <td style={td}>{r.doc_no}</td><td style={td}>{r.doc_date?.slice(0,10)}</td><td style={td}>{r.description}</td><td style={{...td,textAlign:'right'}}>{fmt(r.amount||0)}</td><td style={{...td,textAlign:'center'}}>{r.method}</td><td style={{...td,textAlign:'center'}}>{r.status}</td>
          <td style={{...td,whiteSpace:'nowrap'}}><button style={{...btn('#f3f4f6'),marginRight:3}} onClick={()=>{setForm({...r});setShowForm(true)}}>{L('Edit','แก้ไข')}</button><button style={btn('#f3f4f6','#dc2626')} onClick={()=>{if(r.id!==undefined)void del(r.id)}}>{L('Del','ลบ')}</button></td>
        </tr>))}</tbody></table></div>
    {showForm&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',border:'1px solid #d1d5db',borderRadius:12,boxShadow:'0 20px 60px rgba(0,0,0,0.3)',minWidth:420,maxWidth:520,width:'95%'}}>
        <div style={{background:'linear-gradient(135deg,#374151 0%,#4b5563 100%)',padding:'3px 8px',color:'#fff',fontSize:13,fontWeight:700,display:'flex',justifyContent:'space-between'}}>
          <span>{form.id?L('Edit','แก้ไข'):L('New','เพิ่มใหม่')}</span><span style={{cursor:'pointer'}} onClick={()=>setShowForm(false)}>✕</span></div>
        <div style={{padding:16,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 12px'}}>
          <div><div style={{fontSize:12,marginBottom:2}}>{L('Doc No','เลขที่')}</div><input style={inp} value={form.doc_no||''} onChange={e=>setForm((f2)=>({...f2,doc_no:e.target.value}))} /></div>
              <div><div style={{fontSize:12,marginBottom:2}}>{L('Date','วันที่')}</div><input style={inp} type="date" value={form.doc_date||''} onChange={e=>setForm((f2)=>({...f2,doc_date:e.target.value}))} /></div>
              <div><div style={{fontSize:12,marginBottom:2}}>{L('Description','รายละเอียด')}</div><input style={inp} value={form.description||''} onChange={e=>setForm((f2)=>({...f2,description:e.target.value}))} /></div>
              <div><div style={{fontSize:12,marginBottom:2}}>{L('Amount','จำนวนเงิน')}</div><input style={inp} type="number" value={form.amount||''} onChange={e=>setForm((f2)=>({...f2,amount:+e.target.value||0}))} /></div>
              <div><div style={{fontSize:12,marginBottom:2}}>{L('Method','วิธี')}</div><input style={inp} value={form.method||''} onChange={e=>setForm((f2)=>({...f2,method:e.target.value}))} /></div>
              <div><div style={{fontSize:12,marginBottom:2}}>{L('Status','สถานะ')}</div><input style={inp} value={form.status||''} onChange={e=>setForm((f2)=>({...f2,status:e.target.value}))} /></div>
        </div>
        <div style={{padding:'8px 16px 12px',display:'flex',gap:8,justifyContent:'flex-end',borderTop:'1px solid #999'}}>
          <button style={btn('#f3f4f6')} onClick={()=>setShowForm(false)}>{L('Cancel','ยกเลิก')}</button>
          <button style={btn('#f3f4f6','#4b5563')} disabled={loading} onClick={save}>{loading?'...':L('Save','บันทึก')}</button>
        </div></div></div>}
  </div></AccWindow>)
}
