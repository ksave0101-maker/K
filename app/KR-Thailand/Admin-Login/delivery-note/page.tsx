"use client"

import React, { useEffect, useState, useRef } from 'react'
import AdminLayout from '../components/AdminLayout'
import CreatedBy from '../components/CreatedBy'
import { useRouter } from 'next/navigation'
import styles from '../admin-theme.module.css'

type Item = {
  desc: string
  qty: number
  unit: string
  remark: string
}

type Customer = {
  name: string
  address: string
  phone: string
  contactPerson: string
}

type Shipping = {
  address: string
  receiverName: string
  receiverPhone: string
}

const COMPANY_INFO = {
  name: 'K Energy Save Co., Ltd.',
  nameTh: 'บริษัท เค เอนเนอร์ยี่ เซฟ จำกัด',
  address: '84 Chaloem Phrakiat Rama 9 Soi 34\nNong Bon, Prawet\nBangkok 10250, Thailand',
  addressTh: '',
  phone: '+66 2 080 8916',
  email: 'info@kenergy-save.com'
}

export default function DeliveryNotePage() {
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  const [deliveryNo, setDeliveryNo] = useState('')
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().split('T')[0])
  const [customer, setCustomer] = useState<Customer>({ name: '', address: '', phone: '', contactPerson: '' })
  const [shipping, setShipping] = useState<Shipping>({ address: '', receiverName: '', receiverPhone: '' })
  const [sameAsCustomer, setSameAsCustomer] = useState(true)
  const [items, setItems] = useState<Item[]>([{ desc: '', qty: 1, unit: 'ชิ้น', remark: '' }])
  const [deliveryPerson, setDeliveryPerson] = useState('')
  const [vehicleNo, setVehicleNo] = useState('')
  const [notes, setNotes] = useState('')
  const [refOrderNo, setRefOrderNo] = useState('')
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoices, setInvoices] = useState<any[] | null>(null)
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [invoiceLoading, setInvoiceLoading] = useState(false)

  const [locale, setLocale] = useState<'en'|'th'>(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      return l === 'th' ? 'th' : 'en'
    } catch { return 'th' }
  })

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as any).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') setLocale(v)
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  useEffect(() => {
    // Load customers list
    ;(async () => {
      try {
        const res = await fetch('/api/customers')
        const j = await res.json()
        if (j && j.success && Array.isArray(j.customers)) {
          setCustomers(j.customers)
        }
      } catch (err) {
        console.error('Failed to load customers:', err)
      }
    })()
  }, [])

  const L = (en: string, th: string) => locale === 'th' ? th : en

  // Load initial delivery note number
  useEffect(() => {
    refreshDeliveryNo()
  }, [])

  const units = [
    { value: 'ชิ้น', label: L('Piece', 'ชิ้น') },
    { value: 'เครื่อง', label: L('Unit', 'เครื่อง') },
    { value: 'ชุด', label: L('Set', 'ชุด') },
    { value: 'กล่อง', label: L('Box', 'กล่อง') },
    { value: 'ลัง', label: L('Crate', 'ลัง') },
    { value: 'ม้วน', label: L('Roll', 'ม้วน') },
    { value: 'แผ่น', label: L('Sheet', 'แผ่น') },
    { value: 'อื่นๆ', label: L('Other', 'อื่นๆ') }
  ]

  function addItem() { setItems([...items, { desc: '', qty: 1, unit: 'ชิ้น', remark: '' }]) }
  function updateItem(i: number, key: keyof Item, value: any) {
    const copy = [...items]
    if (key === 'qty') {
      copy[i][key] = Number(value) || 0
    } else {
      copy[i][key] = value
    }
    setItems(copy)
  }
  function removeItem(i: number) {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== i))
    }
  }

  async function refreshDeliveryNo() {
    try {
      const res = await fetch('/api/delivery-seq')
      const j = await res.json()
      if (res.ok && j && j.success && j.formatted) {
        setDeliveryNo(j.formatted)
      } else {
        // Fallback to local generation
        const today = new Date()
        const yy = String(today.getFullYear()).slice(-2)
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        const prefix = `DN-${yy}${month}${day}-`
        const seq = String(1).padStart(4, '0')
        setDeliveryNo(prefix + seq)
      }
      // Also update date to today
      setDeliveryDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      console.error('Error generating delivery note number:', err)
    }
  }

  function handleCustomerSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const cusId = e.target.value
    if (!cusId) {
      setCustomer({ name: '', address: '', phone: '', contactPerson: '' })
      return
    }
    const cus = customers.find(c => String(c.cusID || c.id) === cusId)
    if (cus) {
      setCustomer({
        name: cus.fullname || cus.name || '',
        address: cus.address || '',
        phone: cus.phone || cus.tel || '',
        contactPerson: cus.contact_person || ''
      })
      if (sameAsCustomer) {
        setShipping({
          address: cus.address || '',
          receiverName: cus.fullname || cus.name || '',
          receiverPhone: cus.phone || cus.tel || ''
        })
      }
    }
  }

  useEffect(() => {
    if (sameAsCustomer) {
      setShipping({
        address: customer.address,
        receiverName: customer.contactPerson || customer.name,
        receiverPhone: customer.phone
      })
    }
  }, [sameAsCustomer, customer])

  useEffect(() => {
    // Receive selected invoice from invoice list opened as a selector
    function handler(e: MessageEvent) {
      try {
        const d = e.data
        if (!d || d.type !== 'k-system-invoice-selected') return
        const inv = d.invoice
        const invNo = inv?.invNo || inv?.invoice_no || inv?.inv_id || inv?.invNo
        if (invNo) fetchAndApplyInvoice(String(invNo))
      } catch (err) {
        console.error('Error handling invoice selection message', err)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  async function importFromInvoice() {
    // keep backward-compatible prompt flow
    const invNo = window.prompt(L('Enter Invoice No.', 'กรุณาใส่เลขที่ใบแจ้งหนี้'))
    if (!invNo) return
    await fetchAndApplyInvoice(invNo)
  }

  async function fetchAndApplyInvoice(invNo: string) {
    try {
      const res = await fetch(`/api/invoices?invNo=${encodeURIComponent(invNo)}`)
      const j = await res.json()
      if (!res.ok || !j.success || !j.invoice) {
        alert(L('Invoice not found', 'ไม่พบใบแจ้งหนี้'))
        return
      }
      const inv = j.invoice
      // Set reference
      setRefOrderNo(invNo)
      // Get customer info if available
      if (inv.cusID) {
        try {
          const cusRes = await fetch(`/api/customers?id=${inv.cusID}`)
          const cusJ = await cusRes.json()
          if (cusRes.ok && cusJ.success && cusJ.customer) {
            const cu = cusJ.customer
            setCustomer({
              name: cu.fullname || cu.name || '',
              address: cu.address || '',
              phone: cu.phone || cu.tel || '',
              contactPerson: cu.contact_person || ''
            })
          }
        } catch (e) { console.error(e) }
      }
      // Set items from invoice: map invoice.items if present
      if (Array.isArray(inv.items) && inv.items.length > 0) {
        const mapped = inv.items.map((it: any) => ({
          desc: it.description || it.desc || it.product_name || it.name || '',
          qty: Number(it.quantity || it.qty || 1) || 1,
          unit: it.unit || it.uom || 'ชิ้น',
          remark: it.remark || it.note || ''
        }))
        setItems(mapped)
      } else {
        // Fallback: use invoice total as a single item
        setItems([{
          desc: L('Goods as per Invoice ', 'สินค้าตามใบแจ้งหนี้ ') + invNo,
          qty: 1,
          unit: 'ชุด',
          remark: L('Total: ', 'ยอดรวม: ') + Number(inv.total_amount || 0).toFixed(2) + ' ฿'
        }])
      }
      alert(L('Invoice imported successfully', 'นำเข้าข้อมูลจากใบแจ้งหนี้สำเร็จ'))
    } catch (err) {
      console.error(err)
      alert(L('Failed to fetch invoice', 'เกิดข้อผิดพลาดขณะดึงข้อมูลใบแจ้งหนี้'))
    }
  }

  async function openInvoiceSearch() {
    setShowInvoiceModal(true)
    if (invoices !== null) return
    try {
      setInvoiceLoading(true)
      const res = await fetch('/api/invoices?limit=50')
      const j = await res.json()
      if (res.ok && j && j.success) {
        // try common keys
        const data = j.invoices || j.list || (Array.isArray(j) ? j : [])
        setInvoices(Array.isArray(data) ? data : [])
      } else {
        setInvoices([])
      }
    } catch (e) {
      console.error('Failed to fetch invoices', e)
      setInvoices([])
    } finally { setInvoiceLoading(false) }
  }

  function closeInvoiceSearch() { setShowInvoiceModal(false); setInvoiceSearch('') }

  async function selectInvoice(inv: any) {
    const invNo = inv.invNo || inv.inv_id || inv.invNo || inv.invoice_no || inv.invNo
    if (!invNo) return
    await fetchAndApplyInvoice(String(invNo))
    closeInvoiceSearch()
  }

  async function importFromReceipt() {
    const receiptNo = window.prompt(L('Enter Receipt No.', 'กรุณาใส่เลขที่ใบเสร็จรับเงิน'))
    if (!receiptNo) return
    try {
      const res = await fetch('/api/receipts')
      const j = await res.json()
      if (!res.ok || !j.success) {
        alert(L('Failed to fetch receipts', 'ไม่สามารถดึงข้อมูลใบเสร็จได้'))
        return
      }
      const receipt = (j.receipts || []).find((r: any) => r.receiptNo === receiptNo)
      if (!receipt) {
        alert(L('Receipt not found', 'ไม่พบใบเสร็จรับเงิน'))
        return
      }
      // Set reference
      setRefOrderNo(receipt.invoice_no || receiptNo)
      // Get customer info from linked invoice if available
      if (receipt.invoice_no) {
        try {
          const invRes = await fetch(`/api/receipts?invNo=${encodeURIComponent(receipt.invoice_no)}`)
          const invJ = await invRes.json()
          if (invRes.ok && invJ.success && invJ.invoice && invJ.invoice.cusID) {
            const cusRes = await fetch(`/api/customers?id=${invJ.invoice.cusID}`)
            const cusJ = await cusRes.json()
            if (cusRes.ok && cusJ.success && cusJ.customer) {
              const cu = cusJ.customer
              setCustomer({
                name: cu.fullname || cu.name || '',
                address: cu.address || '',
                phone: cu.phone || cu.tel || '',
                contactPerson: cu.contact_person || ''
              })
            }
          }
        } catch (e) { console.error(e) }
      }
      // Set items from receipt
      setItems([{
        desc: L('Goods as per Receipt ', 'สินค้าตามใบเสร็จ ') + receiptNo,
        qty: 1,
        unit: 'ชุด',
        remark: L('Amount: ', 'จำนวนเงิน: ') + Number(receipt.amount || 0).toFixed(2) + ' ฿'
      }])
      alert(L('Receipt imported successfully', 'นำเข้าข้อมูลจากใบเสร็จสำเร็จ'))
    } catch (err) {
      console.error(err)
      alert(L('Failed to fetch receipt', 'เกิดข้อผิดพลาดขณะดึงข้อมูลใบเสร็จ'))
    }
  }

  function handlePrint() {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert(L('Please allow popups for printing', 'กรุณาอนุญาต popup สำหรับการพิมพ์'))
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${L('Delivery Note', 'ใบจัดส่งสินค้า')} - ${deliveryNo}</title>
        <style>
          body { position: relative; }
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Sarabun', sans-serif; font-size: 14px; color: #333; }
          .logo { position: absolute; left: 20px; top: 20px; width: 60px; }
          .delivery-note { max-width: 210mm; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header .company { font-size: 16px; color: #666; margin-top: 5px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 20px; gap: 20px; }
          .info-box { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
          .info-box h3 { margin: 0 0 8px 0; font-size: 14px; color: #666; border-bottom: 1px solid #eee; padding-bottom: 4px; }
          .info-box p { margin: 4px 0; font-size: 13px; }
          .doc-info { display: flex; justify-content: space-between; margin-bottom: 16px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
          th { background: #f5f5f5; font-weight: 600; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .notes { margin-top: 20px; padding: 10px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 4px; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; }
          .signature-box { width: 180px; text-align: center; }
          .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 8px; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="logo"><img src="/k-energy-save-logo.jpg" style="width:80px;height:80px;border-radius:8px;object-fit:contain;background:#fff;padding:4px;border:1px solid #ddd" alt="K Energy Save"/></div>
        ${printContent.innerHTML}
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  function handleReset() {
    if (!confirm(L('Reset all form fields?', 'ล้างข้อมูลทั้งหมดเพื่อกรอกใหม่?'))) return
    setDeliveryNo('')
    setDeliveryDate(new Date().toISOString().split('T')[0])
    setCustomer({ name: '', address: '', phone: '', contactPerson: '' })
    setShipping({ address: '', receiverName: '', receiverPhone: '' })
    setSameAsCustomer(true)
    setItems([{ desc: '', qty: 1, unit: 'ชิ้น', remark: '' }])
    setDeliveryPerson('')
    setVehicleNo('')
    setNotes('')
    setRefOrderNo('')
    // Generate new delivery number
    refreshDeliveryNo()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!deliveryNo) {
      alert(L('Please generate Delivery Note number', 'กรุณาสร้างเลขที่ใบจัดส่ง'))
      return
    }
    if (!customer.name) {
      alert(L('Please select or enter customer', 'กรุณาเลือกหรือกรอกข้อมูลลูกค้า'))
      return
    }
    setLoading(true)
    try {
      const userRaw = typeof window !== 'undefined' ? localStorage.getItem('k_system_admin_user') : null
      let createdBy = 'thailand admin'
      try { if (userRaw) { const u = JSON.parse(userRaw); createdBy = u?.name || u?.fullname || u?.username || String(u?.userId || createdBy) } } catch(_) {}

      const payload = {
        deliveryNo,
        deliveryDate,
        customer,
        shipping,
        items,
        deliveryPerson,
        vehicleNo,
        notes,
        refOrderNo,
        created_by: createdBy
      }

      const res = await fetch('/api/delivery-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const j = await res.json().catch(() => null)
      if (!res.ok || !j || !j.success) {
        console.error('Failed to save delivery note', j)
        alert(L('Failed to save delivery note', 'ไม่สามารถบันทึกใบจัดส่งได้'))
        setLoading(false)
        return
      }

      alert(L('Delivery note saved', 'บันทึกใบจัดส่งสำเร็จ'))
      router.push('/KR-Thailand/Admin-Login/delivery-note/list')
    } catch (err) {
      console.error('Save error', err)
      alert(L('Failed to save delivery note', 'ไม่สามารถบันทึกใบจัดส่งได้'))
    } finally {
      setLoading(false)
    }
  }

  const shippingAddress = sameAsCustomer ? customer.address : shipping.address
  const receiverName = sameAsCustomer ? (customer.contactPerson || customer.name) : shipping.receiverName
  const receiverPhone = sameAsCustomer ? customer.phone : shipping.receiverPhone

  return (
    <AdminLayout title="Installation & Delivery" titleTh="ติดตั้งและจัดส่ง">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"/>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            {L('Installation & Delivery', 'ติดตั้งและจัดส่ง')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Installation and delivery of products', 'การติดตั้งและจัดส่งสินค้า')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <CreatedBy />
          <form onSubmit={handleSave}>
            {/* Delivery Note Number & Date */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Delivery Note No.', 'เลขที่ใบจัดส่ง')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={deliveryNo}
                    onChange={e => setDeliveryNo(e.target.value)}
                    className={styles.formInput}
                    placeholder="DN-20260124-0001"
                    required
                    style={{ flex: 1 }}
                  />
                  <button type="button" className={styles.btnOutline} onClick={refreshDeliveryNo}>
                    {L('Refresh', 'รีเฟรช')}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Delivery Date', 'วันที่จัดส่ง')}</label>
                <input
                  type="date"
                  value={deliveryDate}
                  readOnly
                  title={L('Fixed to today', 'ตั้งเป็นวันที่ปัจจุบัน')}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Ref. Order No.', 'อ้างอิงใบสั่งซื้อ')}</label>
                <input
                  value={refOrderNo}
                  onChange={e => setRefOrderNo(e.target.value)}
                  className={styles.formInput}
                  placeholder="PO-xxx"
                />
              </div>
            </div>

            {/* Customer Selection */}
            <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>
                {L('Customer Information', 'ข้อมูลลูกค้า')}
              </h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Select Customer', 'เลือกลูกค้า')}</label>
                  <select onChange={handleCustomerSelect} className={styles.formSelect}>
                    <option value="">{L('-- Select or enter manually --', '-- เลือกหรือกรอกเอง --')}</option>
                    {customers.map(c => (
                      <option key={c.cusID || c.id} value={c.cusID || c.id}>
                        {c.fullname || c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {L('Customer Name', 'ชื่อลูกค้า')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    className={styles.formInput}
                    placeholder={L('Customer name', 'ชื่อลูกค้า')}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Contact Person', 'ผู้ติดต่อ')}</label>
                  <input
                    value={customer.contactPerson}
                    onChange={e => setCustomer({ ...customer, contactPerson: e.target.value })}
                    className={styles.formInput}
                    placeholder={L('Contact person name', 'ชื่อผู้ติดต่อ')}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Phone', 'โทรศัพท์')}</label>
                  <input
                    value={customer.phone}
                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    className={styles.formInput}
                    placeholder="02-080-8916"
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label className={styles.formLabel}>{L('Address', 'ที่อยู่')}</label>
                  <input
                    value={customer.address}
                    onChange={e => setCustomer({ ...customer, address: e.target.value })}
                    className={styles.formInput}
                    placeholder={L('Customer address', 'ที่อยู่ลูกค้า')}
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div style={{ marginTop: 16, padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                  {L('Shipping Address', 'ที่อยู่จัดส่ง')}
                </h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sameAsCustomer}
                    onChange={e => setSameAsCustomer(e.target.checked)}
                  />
                  <span style={{ fontSize: 14 }}>{L('Same as customer address', 'เหมือนที่อยู่ลูกค้า')}</span>
                </label>
              </div>
              {!sameAsCustomer && (
                <>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{L('Receiver Name', 'ชื่อผู้รับ')}</label>
                      <input
                        value={shipping.receiverName}
                        onChange={e => setShipping({ ...shipping, receiverName: e.target.value })}
                        className={styles.formInput}
                        placeholder={L('Receiver name', 'ชื่อผู้รับสินค้า')}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{L('Receiver Phone', 'เบอร์ผู้รับ')}</label>
                      <input
                        value={shipping.receiverPhone}
                        onChange={e => setShipping({ ...shipping, receiverPhone: e.target.value })}
                        className={styles.formInput}
                        placeholder="08x-xxx-xxxx"
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup} style={{ flex: 2 }}>
                      <label className={styles.formLabel}>{L('Shipping Address', 'ที่อยู่จัดส่ง')}</label>
                      <input
                        value={shipping.address}
                        onChange={e => setShipping({ ...shipping, address: e.target.value })}
                        className={styles.formInput}
                        placeholder={L('Full shipping address', 'ที่อยู่จัดส่งเต็ม')}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Delivery Info */}
            <div style={{ marginTop: 16, padding: 16, background: '#fef3c7', borderRadius: 8 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>
                {L('Delivery Information', 'ข้อมูลการจัดส่ง')}
              </h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Delivery Person', 'ผู้จัดส่ง/คนขับ')}</label>
                  <input
                    value={deliveryPerson}
                    onChange={e => setDeliveryPerson(e.target.value)}
                    className={styles.formInput}
                    placeholder={L('Driver name', 'ชื่อคนขับ/ผู้จัดส่ง')}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Vehicle No.', 'ทะเบียนรถ')}</label>
                  <input
                    value={vehicleNo}
                    onChange={e => setVehicleNo(e.target.value)}
                    className={styles.formInput}
                    placeholder={L('License plate', 'ทะเบียนรถ')}
                  />
                </div>
              </div>
            </div>

            {/* Import Section (Search only) */}
            <div style={{ marginTop: 16, marginBottom: 16, padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: '#0369a1' }}>{L('Import from:', 'นำเข้าจาก:')}</span>
                <button type="button" onClick={() => {
                  try {
                    const w = window.open('/KR-Thailand/Admin-Login/invoice/list?select=1', '_blank')
                    if (w) w.focus()
                  } catch (e) {
                    window.location.href = '/KR-Thailand/Admin-Login/invoice/list?select=1'
                  }
                }} className={styles.btn} style={{ padding: '8px 12px', background: '#0369a1', color: '#fff' }}>
                  {L('Search Invoice', 'ค้นหาใบแจ้งหนี้')}
                </button>
              </div>
            </div>

            {showInvoiceModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <div style={{ width: '90%', maxWidth: 900, background: '#fff', borderRadius: 8, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>{L('Select Invoice', 'เลือกใบแจ้งหนี้')}</div>
                    <div>
                      <input placeholder={L('Search by invoice no or customer', 'ค้นหาโดยเลขที่หรือชื่อลูกค้า')} value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)} style={{ padding: 8, width: 320, border: '1px solid #e5e7eb', borderRadius: 6 }} />
                      <button onClick={closeInvoiceSearch} style={{ marginLeft: 8, padding: '6px 10px' }}>✕</button>
                    </div>
                  </div>
                  <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
                    {invoiceLoading && <div>Loading…</div>}
                    {!invoiceLoading && invoices && invoices.length === 0 && <div style={{ color: '#666' }}>{L('No invoices found', 'ไม่พบใบแจ้งหนี้')}</div>}
                    {!invoiceLoading && invoices && invoices.length > 0 && (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ borderBottom: '1px solid #eee', padding: 8 }}>{L('Invoice No', 'เลขที่')}</th>
                            <th style={{ borderBottom: '1px solid #eee', padding: 8 }}>{L('Date', 'วันที่')}</th>
                            <th style={{ borderBottom: '1px solid #eee', padding: 8 }}>{L('Customer', 'ลูกค้า')}</th>
                            <th style={{ borderBottom: '1px solid #eee', padding: 8, textAlign: 'right' }}>{L('Total', 'ยอดรวม')}</th>
                            <th style={{ borderBottom: '1px solid #eee', padding: 8 }}>{L('', '')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.filter(inv => {
                            if (!invoiceSearch) return true
                            const s = invoiceSearch.toLowerCase()
                            const invNo = String(inv.invNo || inv.inv_id || inv.invoice_no || '')
                            const cust = String(inv.customer_name || inv.cusName || inv.customer || '')
                            return invNo.toLowerCase().includes(s) || cust.toLowerCase().includes(s)
                          }).map((inv: any) => (
                            <tr key={inv.invNo || inv.inv_id || inv.invoice_no}>
                              <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{inv.invNo || inv.invoice_no || inv.inv_id}</td>
                              <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{inv.invoice_date || inv.invDate || '-'}</td>
                              <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{inv.customer_name || inv.customer || '-'}</td>
                              <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>{Number(inv.total_amount || inv.amount || 0).toFixed(2)}</td>
                              <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}><button onClick={() => selectInvoice(inv)} className={styles.btn}>Select</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className={styles.formLabel}>{L('Items to Deliver', 'รายการสินค้าที่จัดส่ง')}</label>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th>{L('Description', 'รายละเอียด')}</th>
                    <th style={{ width: 100 }}>{L('Qty', 'จำนวน')}</th>
                    <th style={{ width: 120 }}>{L('Unit', 'หน่วย')}</th>
                    <th style={{ width: 200 }}>{L('Remark', 'หมายเหตุ')}</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: 'center' }}>{i + 1}</td>
                      <td>
                        <input
                          value={it.desc}
                          onChange={e => updateItem(i, 'desc', e.target.value)}
                          className={styles.formInput}
                          placeholder={L('Item description', 'รายละเอียดสินค้า')}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={e => updateItem(i, 'qty', e.target.value)}
                          className={styles.formInput}
                          style={{ textAlign: 'center' }}
                        />
                      </td>
                      <td>
                        <select
                          value={it.unit}
                          onChange={e => updateItem(i, 'unit', e.target.value)}
                          className={styles.formSelect}
                        >
                          {units.map(u => (
                            <option key={u.value} value={u.value}>{u.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          value={it.remark}
                          onChange={e => updateItem(i, 'remark', e.target.value)}
                          className={styles.formInput}
                          placeholder={L('Note', 'หมายเหตุ')}
                        />
                      </td>
                      <td>
                        <button type="button" onClick={() => removeItem(i)} className={styles.btnOutline} style={{ padding: '4px 8px' }}>
                          {L('Remove', 'ลบ')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={addItem} className={styles.btnOutline} style={{ marginTop: 8 }}>
                + {L('Add Item', 'เพิ่มรายการ')}
              </button>
            </div>

            {/* Notes */}
            <div style={{ marginTop: 16 }}>
              <label className={styles.formLabel}>{L('Notes / Remarks', 'หมายเหตุ')}</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className={styles.formInput}
                rows={3}
                placeholder={L('Additional notes...', 'หมายเหตุเพิ่มเติม...')}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                </svg>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save', 'บันทึก')}
              </button>
              <button type="button" onClick={handleReset} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                {L('Reset', 'ล้างข้อมูล')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Hidden Print Template */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="delivery-note" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 20, top: 20 }}>
            <img src="/k-energy-save-logo.jpg" alt="K Energy Save" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 4, border: '1px solid #ddd' }} />
          </div>
          <div className="header">
            <h1>{L('DELIVERY NOTE', 'ใบจัดส่งสินค้า')}</h1>
            <div className="company">{locale === 'th' ? COMPANY_INFO.nameTh : COMPANY_INFO.name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{locale === 'th' ? COMPANY_INFO.addressTh : COMPANY_INFO.address}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{L('Phone', 'โทร')}: {COMPANY_INFO.phone}</div>
          </div>

          <div className="doc-info">
            <div>
              <strong>{L('Delivery Note No.', 'เลขที่ใบจัดส่ง')}:</strong> {deliveryNo}
            </div>
            <div>
              <strong>{L('Date', 'วันที่')}:</strong> {deliveryDate}
            </div>
            {refOrderNo && (
              <div>
                <strong>{L('Ref. Order', 'อ้างอิงใบสั่งซื้อ')}:</strong> {refOrderNo}
              </div>
            )}
          </div>

          <div className="info-row">
            <div className="info-box">
              <h3>{L('Customer', 'ลูกค้า')}</h3>
              <p><strong>{customer.name || '-'}</strong></p>
              <p>{customer.address || '-'}</p>
              <p>{L('Phone', 'โทร')}: {customer.phone || '-'}</p>
              {customer.contactPerson && <p>{L('Contact', 'ผู้ติดต่อ')}: {customer.contactPerson}</p>}
            </div>
            <div className="info-box">
              <h3>{L('Ship To', 'จัดส่งถึง')}</h3>
              <p><strong>{receiverName || '-'}</strong></p>
              <p>{shippingAddress || '-'}</p>
              <p>{L('Phone', 'โทร')}: {receiverPhone || '-'}</p>
            </div>
          </div>

          {(deliveryPerson || vehicleNo) && (
            <div style={{ marginBottom: 16, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
              {deliveryPerson && <span><strong>{L('Driver', 'ผู้จัดส่ง')}:</strong> {deliveryPerson} &nbsp;&nbsp;</span>}
              {vehicleNo && <span><strong>{L('Vehicle', 'ทะเบียนรถ')}:</strong> {vehicleNo}</span>}
            </div>
          )}

          <table>
            <thead>
              <tr>
                <th className="text-center" style={{ width: 50 }}>#</th>
                <th>{L('Description', 'รายละเอียด')}</th>
                <th className="text-center" style={{ width: 80 }}>{L('Qty', 'จำนวน')}</th>
                <th className="text-center" style={{ width: 80 }}>{L('Unit', 'หน่วย')}</th>
                <th>{L('Remark', 'หมายเหตุ')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td className="text-center">{i + 1}</td>
                  <td>{it.desc || '-'}</td>
                  <td className="text-center">{it.qty}</td>
                  <td className="text-center">{it.unit}</td>
                  <td>{it.remark || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {notes && (
            <div className="notes">
              <strong>{L('Notes', 'หมายเหตุ')}:</strong> {notes}
            </div>
          )}

          <div className="footer">
            <div className="signature-box">
              <div className="signature-line">{L('Delivered By', 'ผู้จัดส่ง')}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>{deliveryPerson || '...................'}</div>
            </div>
            <div className="signature-box">
              <div className="signature-line">{L('Received By', 'ผู้รับสินค้า')}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>{L('Date', 'วันที่')}: ____/____/______</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
