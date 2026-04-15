"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PurchaseOrderPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    productName: '',
    quantity: '',
    unitPrice: '',
    totalPrice: '',
    deliveryDate: '',
    notes: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }

      // Auto-calculate total price
      if (name === 'quantity' || name === 'unitPrice') {
        const qty = name === 'quantity' ? parseFloat(value) || 0 : parseFloat(updated.quantity) || 0
        const price = name === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(updated.unitPrice) || 0
        updated.totalPrice = (qty * price).toFixed(2)
      }

      return updated
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Purchase Order Data:', formData)
    alert('ใบสั่งซื้อถูกสร้างเรียบร้อยแล้ว!')
    // TODO: Send to API
  }

  return (
    <div style={{ minHeight: '100vh', padding: 24, background: '#f8fafc' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <button onClick={() => router.back()} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', marginRight: 16 }}>
            ← Back
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', margin: 0 }}>สร้างใบสั่งซื้อ / Create Purchase Order</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151' }}>ชื่อลูกค้า / Customer Name</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 15 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151' }}>อีเมล / Email</label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 15 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151' }}>เบอร์โทร / Phone</label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 15 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151' }}>วันที่ส่งมอบ / Delivery Date</label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 15 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151' }}>ชื่อสินค้า / Product Name</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 15 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151' }}>จำนวน / Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="1"
                step="1"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 15 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151' }}>ราคาต่อหน่วย / Unit Price</label>
              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 15 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151' }}>ราคารวม / Total Price</label>
              <input
                type="text"
                name="totalPrice"
                value={formData.totalPrice}
                readOnly
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 15, background: '#f3f4f6' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151' }}>หมายเหตุ / Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 15, fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              style={{ flex: 1, padding: '12px 24px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
            >
              สร้างใบสั่งซื้อ / Create Purchase Order
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ padding: '12px 24px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
            >
              ยกเลิก / Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
