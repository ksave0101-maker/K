"use client"
import React,{useState,useEffect} from 'react'
import AccWindow,{useLang} from '../../components/AccWindow'
interface CashFlowRow {
  id?: number
  method: string
  voucher_type: string
  count: number
  total: number
}

const th:React.CSSProperties={padding:'8px 14px',background:'#4b5563',color:'#fff',fontSize:13,fontWeight:600,textAlign:'left',whiteSpace:'nowrap',borderBottom:'1px solid #d1d5db'}
const td:React.CSSProperties={padding:'7px 14px',borderBottom:'1px solid #e5e7eb',fontSize:13.5}
const fmt=(n:number)=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
export default function CashFlowReportPage(){
  const{L}=useLang()
  const[data,setData]=useState<CashFlowRow[]>([])
  useEffect(()=>{fetch('/api/accounting/reports?type=cashflow').then(r=>r.json()).then(d=>{if(d.ok)setData((d.data||[]) as CashFlowRow[])})},[])
  return(<AccWindow title={L('Cash Flow Report','รายงานกระแสเงินสด')}><div style={{padding:12}}>
    <div style={{overflowX:'auto',border:'1px solid #d1d5db',borderRadius:12,overflow:'hidden',boxShadow:'0 2px 6px rgba(0,0,0,0.08)'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr>{[L('Method','วิธีชำระ'),L('Type','ประเภท'),L('Count','จำนวน'),L('Total','ยอดรวม')].map((h,i)=><th key={i} style={th}>{h}</th>)}</tr></thead>
      <tbody>{data.length===0&&<tr><td colSpan={4} style={{...td,textAlign:'center',color:'#888',padding:20}}>{L('No data','ไม่มีข้อมูล')}</td></tr>}
        {data.map((r,i)=>(<tr key={r.id||i} style={{background:i%2?'#f5f5f5':'#fff'}}>
          <td style={td}>{r.method}</td><td style={td}>{r.voucher_type}</td><td style={{...td,textAlign:'right'}}>{fmt(r.count||0)}</td><td style={{...td,textAlign:'right'}}>{fmt(r.total||0)}</td>
        </tr>))}</tbody></table></div>
  </div></AccWindow>)
}
