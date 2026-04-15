"use client"
import React,{useEffect,useState} from 'react'
import AccWindow,{useLang} from '../../components/AccWindow'
type BalanceRow = { name?: string; balance?: number }

const th:React.CSSProperties={padding:'8px 14px',background:'#4b5563',color:'#fff',fontSize:13,fontWeight:600,textAlign:'left',whiteSpace:'nowrap',borderBottom:'1px solid #d1d5db'}
const td:React.CSSProperties={padding:'7px 14px',borderBottom:'1px solid #e5e7eb',fontSize:13.5}
const fmt=(n:number)=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
export default function ARAPReportPage(){
  const{L}=useLang()
  const[ar,setAr]=useState<BalanceRow[]>([]);const[ap,setAp]=useState<BalanceRow[]>([])
  useEffect(()=>{fetch('/api/accounting/reports?type=ar-ap').then(r=>r.json()).then(d=>{if(d.ok){setAr((d.data?.receivables||[]) as BalanceRow[]);setAp((d.data?.payables||[]) as BalanceRow[])}})},[])
  const Section=({title,titleTh,data:rows}:{title:string,titleTh:string,data:BalanceRow[]})=>(<div style={{marginBottom:16}}>
    <div style={{background:'#4b5563',color:'#fff',padding:'6px 12px',fontSize:14,fontWeight:700}}>{L(title,titleTh)}</div>
    <div style={{border:'1px solid #d1d5db',borderRadius:12,overflow:'hidden',boxShadow:'0 2px 6px rgba(0,0,0,0.08)'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr><th style={th}>{L('Name','ชื่อ')}</th><th style={th}>{L('Balance','ยอดค้าง')}</th></tr></thead>
      <tbody>{rows.length===0&&<tr><td colSpan={2} style={{...td,textAlign:'center',color:'#888',padding:16}}>{L('No data','ไม่มีข้อมูล')}</td></tr>}
        {rows.map((r,i)=>(<tr key={i} style={{background:i%2?'#f5f5f5':'#fff'}}>
          <td style={td}>{r.name}</td><td style={{...td,textAlign:'right'}}>{fmt(r.balance||0)}</td>
        </tr>))}<tr style={{background:'#e8e8e8'}}><td style={{...td,fontWeight:700}}>{L('Total','รวม')}</td><td style={{...td,textAlign:'right',fontWeight:700}}>{fmt(rows.reduce((s,r)=>s+(r.balance||0),0))}</td></tr>
      </tbody></table></div></div>)
  return(<AccWindow title={L('AR/AP Report','รายงานลูกหนี้/เจ้าหนี้')}><div style={{padding:12}}>
    <Section title="Accounts Receivable" titleTh="ลูกหนี้การค้า" data={ar}/>
    <Section title="Accounts Payable" titleTh="เจ้าหนี้การค้า" data={ap}/>
  </div></AccWindow>)
}