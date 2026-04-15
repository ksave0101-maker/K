"use client"
import React,{useState,useEffect} from 'react'
import AccWindow,{useLang} from '../../components/AccWindow'
interface InventoryReportRow {
  id?: number
  code: string
  name_th: string
  unit: string
  qty_onhand: number
  cost_price: number
  sale_price: number
}

const th:React.CSSProperties={padding:'8px 14px',background:'#4b5563',color:'#fff',fontSize:13,fontWeight:600,textAlign:'left',whiteSpace:'nowrap',borderBottom:'1px solid #d1d5db'}
const td:React.CSSProperties={padding:'7px 14px',borderBottom:'1px solid #e5e7eb',fontSize:13.5}
const fmt=(n:number)=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
export default function InventoryReportPage(){
  const{L}=useLang()
  const[data,setData]=useState<InventoryReportRow[]>([])
  useEffect(()=>{fetch('/api/accounting/reports?type=inventory').then(r=>r.json()).then(d=>{if(d.ok)setData((d.data||[]) as InventoryReportRow[])})},[])
  return(<AccWindow title={L('Inventory Report','รายงานสินค้าคงเหลือ')}><div style={{padding:12}}>
    <div style={{overflowX:'auto',border:'1px solid #d1d5db',borderRadius:12,overflow:'hidden',boxShadow:'0 2px 6px rgba(0,0,0,0.08)'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr>{[L('Code','รหัส'),L('Name','ชื่อสินค้า'),L('Unit','หน่วย'),L('Qty','คงเหลือ'),L('Cost','ทุน'),L('Price','ราคาขาย')].map((h,i)=><th key={i} style={th}>{h}</th>)}</tr></thead>
      <tbody>{data.length===0&&<tr><td colSpan={6} style={{...td,textAlign:'center',color:'#888',padding:20}}>{L('No data','ไม่มีข้อมูล')}</td></tr>}
        {data.map((r,i)=>(<tr key={r.id||i} style={{background:i%2?'#f5f5f5':'#fff'}}>
          <td style={td}>{r.code}</td><td style={td}>{r.name_th}</td><td style={td}>{r.unit}</td><td style={{...td,textAlign:'right'}}>{fmt(r.qty_onhand||0)}</td><td style={{...td,textAlign:'right'}}>{fmt(r.cost_price||0)}</td><td style={{...td,textAlign:'right'}}>{fmt(r.sale_price||0)}</td>
        </tr>))}</tbody></table></div>
  </div></AccWindow>)
}
