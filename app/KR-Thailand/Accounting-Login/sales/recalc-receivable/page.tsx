"use client"
import React,{useState,useEffect} from 'react'
import AccWindow,{useLang} from '../../components/AccWindow'
interface ReceivableRow {
  name: string
  balance: number
}

const th:React.CSSProperties={padding:'8px 14px',background:'#4b5563',color:'#fff',fontSize:13,fontWeight:600,textAlign:'left',whiteSpace:'nowrap',borderBottom:'1px solid #d1d5db'}
const td:React.CSSProperties={padding:'7px 14px',borderBottom:'1px solid #e5e7eb',fontSize:13.5}
const fmt=(n:number)=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
export default function RecalcReceivablePage(){
  const{L}=useLang()
  const[data,setData]=useState<ReceivableRow[]>([])
  useEffect(()=>{fetch('/api/accounting/reports?type=ar-ap').then(r=>r.json()).then(d=>{if(d.ok)setData((d.data?.receivables||[]) as ReceivableRow[])})},[])
  return(<AccWindow title={L('Recalculate AR','คำนวณยอดลูกหนี้ใหม่')}><div style={{padding:12}}>
    <div style={{overflowX:'auto',border:'1px solid #d1d5db',borderRadius:12,overflow:'hidden',boxShadow:'0 2px 6px rgba(0,0,0,0.08)'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr><th style={th}>{L('Customer','ลูกค้า')}</th><th style={th}>{L('Balance','ยอดค้าง')}</th></tr></thead>
      <tbody>{data.length===0&&<tr><td colSpan={2} style={{...td,textAlign:'center',color:'#888',padding:20}}>{L('No data','ไม่มีข้อมูล')}</td></tr>}
        {data.map((r,i)=>(<tr key={i} style={{background:i%2?'#f5f5f5':'#fff'}}>
          <td style={td}>{r.name}</td><td style={{...td,textAlign:'right'}}>{fmt(r.balance||0)}</td>
        </tr>))}<tr style={{background:'#e8e8e8'}}><td style={{...td,fontWeight:700}}>{L('Total','รวม')}</td><td style={{...td,textAlign:'right',fontWeight:700}}>{fmt(data.reduce((s,r)=>s+(r.balance||0),0))}</td></tr>
      </tbody></table></div>
  </div></AccWindow>)
}
