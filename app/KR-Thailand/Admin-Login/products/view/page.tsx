"use client"

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import AdminLayout from '../../components/AdminLayout'
import styles from '../../admin-theme.module.css'

type Product = {
  id: number
  productID: number
  sku?: string
  name: string
  description?: string
  capacity?: string
  mcb?: string
  size?: string
  weight?: string
  price?: number
  price_vat?: number
  unit?: string
  category?: string
  image?: string
  stock_qty?: number
  is_active?: boolean
}

export default function ProductViewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get('id')

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lang, setLang] = useState<'en'|'th'>(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      return l === 'th' ? 'th' : 'en'
    } catch { return 'en' }
  })

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as any).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') setLang(v)
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  useEffect(() => {
    if (!id) {
      setError('Product ID is required')
      setLoading(false)
      return
    }

    let mounted = true
    ;(async () => {
      try {
        const res = await fetch(`/api/products?id=${id}`)
        const j = await res.json()
        if (mounted) {
          if (!res.ok || !j || !j.success) {
            setError(j?.error || 'Failed to load product')
          } else {
            const data = j.products?.[0] || j.rows?.[0] || null
            setProduct(data)
          }
        }
      } catch (err: any) {
        if (mounted) setError(String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [id])

  const L = (en: string, th: string) => lang === 'th' ? th : en

  if (loading) {
    return (
      <AdminLayout title="Product Details" titleTh="รายละเอียดสินค้า">
        <div className={styles.contentCard}>
          <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !product) {
    return (
      <AdminLayout title="Product Details" titleTh="รายละเอียดสินค้า">
        <div className={styles.contentCard}>
          <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>
            {error || 'Product not found'}
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              onClick={() => router.push('/KR-Thailand/Admin-Login/products/list')}
              className={styles.btnOutline}
            >
              {L('Back to List', 'กลับไปหน้ารายการ')}
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Product Details" titleTh="รายละเอียดสินค้า">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{product.name}</h2>
          <p className={styles.cardSubtitle}>
            {L('Product ID:', 'รหัสสินค้า:')} {product.sku || `#${product.id}`}
          </p>
        </div>

        <div className={styles.cardBody}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32 }}>
            {/* Left: Product Image */}
            <div>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    height: 'auto',
                    borderRadius: 12,
                    border: '1px solid #e6eef7',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  maxWidth: 400,
                  aspectRatio: '1',
                  background: '#f8fafc',
                  borderRadius: 12,
                  border: '1px solid #e6eef7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  fontSize: 14
                }}>
                  {L('No image available', 'ไม่มีรูปภาพ')}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <div style={{
                  padding: '12px 16px',
                  background: product.is_active ? '#d1fae5' : '#fee2e2',
                  color: product.is_active ? '#065f46' : '#991b1b',
                  borderRadius: 8,
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                  {product.is_active ? L('Active', 'ใช้งาน') : L('Inactive', 'ไม่ใช้งาน')}
                </div>
              </div>
            </div>

            {/* Right: Product Details */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <DetailRow
                  label={L('Product Name', 'ชื่อสินค้า')}
                  value={product.name}
                />

                {product.description && (
                  <DetailRow
                    label={L('Description', 'รายละเอียด')}
                    value={product.description}
                  />
                )}

                {product.category && (
                  <DetailRow
                    label={L('Category', 'หมวดหมู่')}
                    value={product.category}
                  />
                )}

                {product.capacity && (
                  <DetailRow
                    label={L('Capacity (kVA)', 'กำลังไฟฟ้า (kVA)')}
                    value={product.capacity}
                  />
                )}

                {product.mcb && (
                  <DetailRow
                    label="MCB"
                    value={product.mcb}
                  />
                )}

                {product.size && (
                  <DetailRow
                    label={L('Size (WxLxH cm)', 'ขนาด (กxยxส cm)')}
                    value={product.size}
                  />
                )}

                {product.weight && (
                  <DetailRow
                    label={L('Weight', 'น้ำหนัก')}
                    value={product.weight}
                  />
                )}

                <DetailRow
                  label={L('Price', 'ราคา')}
                  value={product.price != null ? `฿${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                />

                {product.price_vat != null && (
                  <DetailRow
                    label={L('Price (incl. VAT)', 'ราคารวม VAT')}
                    value={`฿${Number(product.price_vat).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  />
                )}

                {product.unit && (
                  <DetailRow
                    label={L('Unit', 'หน่วย')}
                    value={product.unit}
                  />
                )}

                <DetailRow
                  label={L('Stock Quantity', 'จำนวนสต็อก')}
                  value={product.stock_qty != null ? String(product.stock_qty) : '-'}
                />
              </div>

              <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
                <button
                  onClick={() => router.push('/KR-Thailand/Admin-Login/products/list')}
                  className={styles.btnOutline}
                >
                  {L('Back to List', 'กลับไปหน้ารายการ')}
                </button>
                <button
                  onClick={() => router.push(`/KR-Thailand/Admin-Login/product-add?id=${product.id}`)}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  {L('Edit', 'แก้ไข')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '180px 1fr',
      gap: 16,
      padding: '12px 0',
      borderBottom: '1px solid #f1f5f9'
    }}>
      <div style={{ fontWeight: 600, color: '#64748b' }}>{label}:</div>
      <div style={{ color: '#0f172a' }}>{value}</div>
    </div>
  )
}
