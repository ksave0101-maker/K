"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Row = any

const ORANGE = '#f97316'
const GREEN = '#10b981'
const RED = '#ef4444'

function num(v: any) {
  if (v === undefined || v === null || Number.isNaN(Number(v))) return '--'
  return Number(v).toFixed(1)
}

function DeviceCard({ r }: { r: Row }) {
  const router = useRouter()
  const [hover, setHover] = useState(false)
  const last = r.time ? new Date(r.time) : null
  const diffSec = last ? Math.floor((Date.now() - last.getTime()) / 1000) : null
  const connected = diffSec !== null && diffSec < 300

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ width: 300, transform: hover ? 'translateY(-6px)' : 'none', transition: 'transform 160ms ease, box-shadow 160ms ease', cursor: 'pointer' }}>
      <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: hover ? '0 14px 40px rgba(2,6,23,0.12)' : '0 8px 22px rgba(2,6,23,0.06)', border: '1px solid rgba(226,232,240,1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{r.device || r.ksave || '—'}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: '#10b981' }}>👑</div>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: connected ? GREEN : RED }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 6, alignItems: 'center', marginTop: 6 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#475569' }}>⚡ Voltage LL1</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>{num(r.power_metrics?.L1)}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#475569' }}>⚡ Voltage LL2</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>{num(r.power_metrics?.L2)}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#475569' }}>⚡ Voltage LL3</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>{num(r.power_metrics?.L3)}</div>
            </div>
          </div>

          <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: 12 }}>VOLT</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <div style={{ fontSize: 12, color: connected ? GREEN : RED }}>
            {connected ? `${String(diffSec)}s ago` : (r.time ? `Last: ${new Date(r.time).toISOString().replace('T',' ').split('.')[0]}` : 'No data')}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => router.push(`/device-monitoring?device=${encodeURIComponent(r.ksave || r.device || '')}`)} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontSize: 16 }}>📊</button>
            <button style={{ background: 'transparent', border: 'none', color: ORANGE, cursor: 'pointer', fontSize: 14 }}>✏️</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function KsaveListPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All Devices')
  const [active, setActive] = useState('Overview')
  const [products, setProducts] = useState<any[]>([])
  const [productsLoading, setProductsLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    async function fetchRecords() {
      try {
        const res = await fetch('/api/power-records?limit=100')
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        const raw = (data && data.rows) ? data.rows : []

        const normalized = raw.map((r: any, i: number) => ({
          id: r.id ?? i,
          device: r.device ?? r.ksave ?? r.name ?? `device-${i}`,
          ksave: r.ksave ?? r.device ?? null,
          time: r.time ?? r.last_seen ?? r.updated_at ?? null,
          power_metrics: Object.assign({ L1: null, L2: null, L3: null }, r.power_metrics || r.metrics || {}),
        }))

        setRows(normalized)
      } catch (e) {
        console.error('fetch error', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchRecords()
    const iv = setInterval(fetchRecords, 5000)
    return () => { mounted = false; clearInterval(iv) }
  }, [])

  useEffect(() => {
    if (active === 'Products Info') {
      fetchProducts()
    }
  }, [active])

  async function fetchProducts() {
    setProductsLoading(true)
    try {
      const res = await fetch('/api/products?limit=50&active=true')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      if (data.success) {
        setProducts(data.rows || [])
      }
    } catch (e) {
      console.error('fetch products error', e)
    } finally {
      setProductsLoading(false)
    }
  }

  const filtered = rows.filter(r => filter === 'All Devices' ? true : (r.role === filter))

  // Navigation anchors are static in markup now; no runtime href tweaks required.

  const renderActiveContent = () => {
    switch (active) {
      case 'Dashboard': {
        const total = rows.length
        const connected = rows.filter(r => {
          const last = r.time ? new Date(r.time) : null
          const diff = last ? Math.floor((Date.now() - last.getTime()) / 1000) : null
          return diff !== null && diff < 300
        }).length
        const disconnected = total - connected
        const avgVoltageL1 = rows.length > 0 ? (rows.reduce((sum, r) => sum + (Number(r.power_metrics?.L1) || 0), 0) / rows.length).toFixed(1) : '0'
        const avgVoltageL2 = rows.length > 0 ? (rows.reduce((sum, r) => sum + (Number(r.power_metrics?.L2) || 0), 0) / rows.length).toFixed(1) : '0'
        const avgVoltageL3 = rows.length > 0 ? (rows.reduce((sum, r) => sum + (Number(r.power_metrics?.L3) || 0), 0) / rows.length).toFixed(1) : '0'

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Dashboard</h1>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div style={{ background: 'white', padding: 18, borderRadius: 12, border: '1px solid #e6eef7' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total Devices</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>{total}</div>
              </div>
              <div style={{ background: 'white', padding: 18, borderRadius: 12, border: '1px solid #e6eef7' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Connected</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{connected}</div>
              </div>
              <div style={{ background: 'white', padding: 18, borderRadius: 12, border: '1px solid #e6eef7' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Disconnected</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{disconnected}</div>
              </div>
              <div style={{ background: 'white', padding: 18, borderRadius: 12, border: '1px solid #e6eef7' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Last Update</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{rows.length ? new Date(rows[0].time || Date.now()).toLocaleTimeString() : '—'}</div>
              </div>
            </div>

            {/* Voltage Averages */}
            <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Average Voltage</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Phase L1</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#f97316' }}>{avgVoltageL1} V</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Phase L2</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#06b6d4' }}>{avgVoltageL2} V</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Phase L3</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>{avgVoltageL3} V</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Recent Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rows.slice(0, 5).map((r, i) => {
                  const last = r.time ? new Date(r.time) : null
                  const diffSec = last ? Math.floor((Date.now() - last.getTime()) / 1000) : null
                  const isConnected = diffSec !== null && diffSec < 300
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: isConnected ? GREEN : RED }} />
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.device || '—'}</span>
                      </div>
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        {isConnected ? `${diffSec}s ago` : (last ? last.toLocaleString() : 'No data')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      }
      case 'Monitor':
        return (
          <div>
            <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
              <input placeholder="ค้นหา device" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <button style={{ padding: '8px 12px', borderRadius: 8, background: '#06b6d4', color: 'white', border: 'none' }}>Search</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {filtered.map(r => <DeviceCard key={r.id} r={r} />)}
            </div>
          </div>
        )
      case 'Location':
        return (
          <div style={{ background: 'white', padding: 20, borderRadius: 12 }}>
            <div style={{ height: 360, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Map placeholder</div>
            <div style={{ marginTop: 12, color: '#6b7280' }}>ตำแหน่งของอุปกรณ์จะแสดงบนแผนที่ที่นี่</div>
          </div>
        )
      case 'Notifications':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Notifications</h1>
              <button style={{ padding: '8px 16px', borderRadius: 8, background: '#06b6d4', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                Mark All Read
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e6eef7', overflow: 'hidden' }}>
              {[
                { type: 'warning', icon: '⚠️', title: 'Device Offline', message: 'Device K-SAVE-001 went offline', time: '5 minutes ago', read: false },
                { type: 'success', icon: '✅', title: 'Connection Restored', message: 'Device K-SAVE-003 is back online', time: '15 minutes ago', read: false },
                { type: 'info', icon: 'ℹ️', title: 'System Update', message: 'New firmware version available', time: '1 hour ago', read: true },
                { type: 'error', icon: '❌', title: 'High Voltage Alert', message: 'Phase L1 voltage exceeded threshold at K-SAVE-005', time: '2 hours ago', read: true },
                { type: 'info', icon: '📊', title: 'Weekly Report Ready', message: 'Your weekly energy report is available', time: '1 day ago', read: true },
              ].map((notif, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 20px', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none', background: notif.read ? 'white' : '#f0f9ff' }}>
                  <div style={{ fontSize: 20 }}>{notif.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 4 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{notif.title}</div>
                      {!notif.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>{notif.message}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{notif.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'Devices Setting':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Devices Setting</h1>

            <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Alert Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
                  <span style={{ flex: 1, fontSize: 14 }}>Enable offline alerts</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
                  <span style={{ flex: 1, fontSize: 14 }}>Enable voltage threshold alerts</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <input type="checkbox" style={{ width: 18, height: 18 }} />
                  <span style={{ flex: 1, fontSize: 14 }}>Enable current threshold alerts</span>
                </label>
              </div>
            </div>

            <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Threshold Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>Maximum Voltage (V)</label>
                  <input type="number" defaultValue="250" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>Minimum Voltage (V)</label>
                  <input type="number" defaultValue="200" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>Connection Timeout (seconds)</label>
                  <input type="number" defaultValue="300" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button style={{ padding: '10px 20px', borderRadius: 8, background: '#e5e7eb', color: '#0f172a', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button style={{ padding: '10px 20px', borderRadius: 8, background: '#06b6d4', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Save Changes
              </button>
            </div>
          </div>
        )
      case 'Dashboard Setting':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Dashboard Setting</h1>

            <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Display Options</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
                  <span style={{ flex: 1, fontSize: 14 }}>Show device totals</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <input type="checkbox" style={{ width: 18, height: 18 }} />
                  <span style={{ flex: 1, fontSize: 14 }}>Compact view mode</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
                  <span style={{ flex: 1, fontSize: 14 }}>Show voltage charts</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
                  <span style={{ flex: 1, fontSize: 14 }}>Show recent activity</span>
                </label>
              </div>
            </div>

            <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Refresh Rate</h3>
              <select defaultValue="5000" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}>
                <option value="1000">Every 1 second</option>
                <option value="5000">Every 5 seconds</option>
                <option value="10000">Every 10 seconds</option>
                <option value="30000">Every 30 seconds</option>
                <option value="60000">Every 1 minute</option>
              </select>
            </div>

            <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Theme</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <button style={{ padding: '12px', borderRadius: 8, border: '2px solid #06b6d4', background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#06b6d4' }}>
                  ☀️ Light
                </button>
                <button style={{ padding: '12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 14 }}>
                  🌙 Dark
                </button>
                <button style={{ padding: '12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 14 }}>
                  🔄 Auto
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button style={{ padding: '10px 20px', borderRadius: 8, background: '#e5e7eb', color: '#0f172a', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Reset to Default
              </button>
              <button style={{ padding: '10px 20px', borderRadius: 8, background: '#06b6d4', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Save Settings
              </button>
            </div>
          </div>
        )
      case 'Products Info':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Products Info</h1>
              <button style={{ padding: '8px 16px', borderRadius: 8, background: '#06b6d4', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                + Add Product
              </button>
            </div>

            {productsLoading ? (
              <div style={{ background: 'white', padding: 40, borderRadius: 12, textAlign: 'center', color: '#64748b' }}>
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div style={{ background: 'white', padding: 40, borderRadius: 12, textAlign: 'center', color: '#64748b' }}>
                No products found
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e6eef7', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 2fr 120px 100px 120px 150px', gap: 12, padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e6eef7', fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                  <div>SKU</div>
                  <div>Product Name</div>
                  <div>Category</div>
                  <div>Price</div>
                  <div>Stock</div>
                  <div>Action</div>
                </div>
                {products.map((product, i) => (
                  <div key={product.productID} style={{ display: 'grid', gridTemplateColumns: '100px 2fr 120px 100px 120px 150px', gap: 12, padding: '16px 20px', borderBottom: i < products.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{product.sku || `#${product.productID}`}</div>
                    <div>
                      <div style={{ color: '#0f172a', fontWeight: 600, fontSize: 14 }}>{product.name}</div>
                      {product.description && (
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.description}</div>
                      )}
                    </div>
                    <div>
                      {product.category ? (
                        <span style={{ padding: '4px 10px', borderRadius: 6, background: '#f0f9ff', color: '#0369a1', fontSize: 12, fontWeight: 600 }}>{product.category}</span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {product.price ? `฿${Number(product.price).toLocaleString()}` : '—'}
                    </div>
                    <div>
                      <span style={{ padding: '4px 10px', borderRadius: 6, background: product.stock_qty > 0 ? '#d1fae5' : '#fee2e2', color: product.stock_qty > 0 ? '#065f46' : '#991b1b', fontSize: 12, fontWeight: 600 }}>
                        {product.stock_qty || 0} {product.unit || 'units'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ padding: '6px 12px', borderRadius: 6, background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>View</button>
                      <button style={{ padding: '6px 12px', borderRadius: 6, background: '#f0f9ff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#0369a1' }}>Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case 'Support Tickets':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Support Tickets</h1>
              <button style={{ padding: '8px 16px', borderRadius: 8, background: '#06b6d4', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                + New Ticket
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e6eef7', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 2fr 1fr 1fr 120px', gap: 12, padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e6eef7', fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                <div>Ticket ID</div>
                <div>Subject</div>
                <div>Priority</div>
                <div>Status</div>
                <div>Created</div>
              </div>
              {[
                { id: '#TK-1234', subject: 'Device K-SAVE-001 not responding', priority: 'High', status: 'Open', created: '2 hours ago' },
                { id: '#TK-1233', subject: 'Voltage reading incorrect on Phase L2', priority: 'Medium', status: 'In Progress', created: '5 hours ago' },
                { id: '#TK-1232', subject: 'Request for installation support', priority: 'Low', status: 'Resolved', created: '1 day ago' },
                { id: '#TK-1231', subject: 'Dashboard not loading data', priority: 'High', status: 'Resolved', created: '2 days ago' },
                { id: '#TK-1230', subject: 'Need help with configuration', priority: 'Medium', status: 'Closed', created: '3 days ago' },
              ].map((ticket, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 2fr 1fr 1fr 120px', gap: 12, padding: '16px 20px', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none', alignItems: 'center', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ fontWeight: 600, color: '#06b6d4' }}>{ticket.id}</div>
                  <div style={{ color: '#0f172a' }}>{ticket.subject}</div>
                  <div><span style={{ padding: '4px 10px', borderRadius: 6, background: ticket.priority === 'High' ? '#fee2e2' : ticket.priority === 'Medium' ? '#fef3c7' : '#dbeafe', color: ticket.priority === 'High' ? '#991b1b' : ticket.priority === 'Medium' ? '#92400e' : '#1e40af', fontSize: 12, fontWeight: 600 }}>{ticket.priority}</span></div>
                  <div><span style={{ padding: '4px 10px', borderRadius: 6, background: ticket.status === 'Open' ? '#fee2e2' : ticket.status === 'In Progress' ? '#fef3c7' : '#d1fae5', color: ticket.status === 'Open' ? '#991b1b' : ticket.status === 'In Progress' ? '#92400e' : '#065f46', fontSize: 12, fontWeight: 600 }}>{ticket.status}</span></div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{ticket.created}</div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'User Feedback':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>User Feedback</h1>

            <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Submit Feedback</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>Feedback Type</label>
                  <select style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}>
                    <option>Bug Report</option>
                    <option>Feature Request</option>
                    <option>General Feedback</option>
                    <option>Improvement Suggestion</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>Subject</label>
                  <input type="text" placeholder="Brief description of your feedback" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>Details</label>
                  <textarea placeholder="Please provide detailed feedback..." rows={4} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontFamily: 'inherit', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button style={{ padding: '10px 20px', borderRadius: 8, background: '#06b6d4', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>

            <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Recent Feedback</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { type: 'Feature Request', subject: 'Add export to CSV functionality', status: 'Under Review', date: '2 days ago' },
                  { type: 'Bug Report', subject: 'Chart not displaying correctly on mobile', status: 'Fixed', date: '5 days ago' },
                  { type: 'Improvement', subject: 'Improve dashboard loading speed', status: 'In Progress', date: '1 week ago' },
                ].map((feedback, i) => (
                  <div key={i} style={{ padding: '14px', borderRadius: 8, border: '1px solid #f1f5f9', background: '#fafbfc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: '#e0f2fe', color: '#0369a1', fontWeight: 600, marginRight: 8 }}>{feedback.type}</span>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{feedback.subject}</span>
                      </div>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: feedback.status === 'Fixed' ? '#d1fae5' : feedback.status === 'In Progress' ? '#fef3c7' : '#e0e7ff', color: feedback.status === 'Fixed' ? '#065f46' : feedback.status === 'In Progress' ? '#92400e' : '#3730a3', fontWeight: 600 }}>{feedback.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{feedback.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      case 'Help & Docs':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Help & Documentation</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700 }}>Getting Started</h3>
                <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#64748b' }}>Learn the basics of using the K-SAVE monitoring system</p>
                <a href="#" style={{ fontSize: 14, color: '#06b6d4', fontWeight: 600, textDecoration: 'none' }}>Read Guide →</a>
              </div>

              <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔧</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700 }}>Installation Guide</h3>
                <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#64748b' }}>Step-by-step instructions for device installation</p>
                <a href="#" style={{ fontSize: 14, color: '#06b6d4', fontWeight: 600, textDecoration: 'none' }}>View Guide →</a>
              </div>

              <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔌</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700 }}>API Documentation</h3>
                <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#64748b' }}>Technical documentation for API integration</p>
                <a href="#" style={{ fontSize: 14, color: '#06b6d4', fontWeight: 600, textDecoration: 'none' }}>View API Docs →</a>
              </div>

              <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>❓</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700 }}>FAQ</h3>
                <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#64748b' }}>Frequently asked questions and answers</p>
                <a href="#" style={{ fontSize: 14, color: '#06b6d4', fontWeight: 600, textDecoration: 'none' }}>View FAQ →</a>
              </div>

              <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📖</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700 }}>User Manual</h3>
                <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#64748b' }}>Complete user manual and troubleshooting</p>
                <a href="#" style={{ fontSize: 14, color: '#06b6d4', fontWeight: 600, textDecoration: 'none' }}>Download PDF →</a>
              </div>

              <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700 }}>Contact Support</h3>
                <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#64748b' }}>Need help? Contact our support team</p>
                <a href="#" style={{ fontSize: 14, color: '#06b6d4', fontWeight: 600, textDecoration: 'none' }}>Contact Us →</a>
              </div>
            </div>

            <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e6eef7' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Quick Links</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <a href="#" style={{ padding: '10px 12px', borderRadius: 8, background: '#f8fafc', color: '#0f172a', textDecoration: 'none', fontSize: 14 }}>→ Device Setup Tutorial</a>
                <a href="#" style={{ padding: '10px 12px', borderRadius: 8, background: '#f8fafc', color: '#0f172a', textDecoration: 'none', fontSize: 14 }}>→ Troubleshooting Guide</a>
                <a href="#" style={{ padding: '10px 12px', borderRadius: 8, background: '#f8fafc', color: '#0f172a', textDecoration: 'none', fontSize: 14 }}>→ Video Tutorials</a>
                <a href="#" style={{ padding: '10px 12px', borderRadius: 8, background: '#f8fafc', color: '#0f172a', textDecoration: 'none', fontSize: 14 }}>→ Release Notes</a>
              </div>
            </div>
          </div>
        )
      case 'User Profile':
        return (
          <div style={{ background: 'white', padding: 18, borderRadius: 12, display: 'flex', gap: 18 }}>
            <div style={{ width: 96, height: 96, borderRadius: 12, background: '#f1f5f9' }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>User Name</div>
              <div style={{ color: '#6b7280' }}>user@example.com</div>
            </div>
          </div>
        )
      case 'Logout':
        return (
          <div style={{ background: 'white', padding: 18, borderRadius: 12 }}>
            <div>กดปุ่มเพื่อออกจากระบบ (placeholder)</div>
            <div style={{ marginTop: 12 }}><button style={{ padding: '8px 12px', borderRadius: 8, background: '#ef4444', color: 'white', border: 'none' }}>Logout</button></div>
          </div>
        )
      default:
        return (
          <div style={{ padding: 28, background: 'white', borderRadius: 12 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{active}</h1>
            <div style={{ marginTop: 12, color: '#6b7280' }}>แสดง UI ของเมนู "{active}" ภายในหน้าเดียวกัน (placeholder)</div>
          </div>
        )
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', maxWidth: 1200, margin: '28px auto', padding: '0 20px', gap: 20 }}>

        {/* Left sidebar (matches screenshot) */}
        <aside style={{ width: 380, background: '#ffffff', borderRadius: 8, padding: 12, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 8px', borderBottom: '1px solid #eef2f7', marginBottom: 8 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', flex: '0 0 64px', padding: 10, border: '2px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <img src="/k-energy-save-logo.jpg" alt="Company logo" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block', borderRadius: '50%' }} />
                </div>
              <div style={{ minWidth: 0, marginLeft: 8 }}>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, lineHeight: '1' }}>K Energy Save co.,Ltd</div>
                <div style={{ fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>Group of Zera</div>
              </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <a href="/KR-Thailand/Admin-Login/dashboard" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', borderRadius: 8, textDecoration: 'none', color: '#475569', fontWeight: 400 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
              <span>Dashboard</span>
            </a>

            <a href="/Ksave-list" onClick={(e) => { e.preventDefault(); setActive('Overview') }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', borderRadius: 8, textDecoration: 'none', color: active === 'Overview' ? '#0f172a' : '#475569', background: active === 'Overview' ? '#eef2f7' : 'transparent', fontWeight: active === 'Overview' ? 700 : 400 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18"></path><path d="M3 12h18"></path><path d="M3 17h18"></path></svg>
              <span>Overview</span>
            </a>

            <a href="#" onClick={(e) => { e.preventDefault(); setActive('Monitor') }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', borderRadius: 8, textDecoration: 'none', color: active === 'Monitor' ? '#0f172a' : '#475569', background: active === 'Monitor' ? '#eef2f7' : 'transparent', fontWeight: active === 'Monitor' ? 700 : 400 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle></svg>
              <span>Monitor</span>
            </a>

            <a href="#" onClick={(e) => { e.preventDefault(); setActive('Location') }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', borderRadius: 8, textDecoration: 'none', color: active === 'Location' ? '#0f172a' : '#475569', background: active === 'Location' ? '#eef2f7' : 'transparent', fontWeight: active === 'Location' ? 700 : 400 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>Location</span>
            </a>

            <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>CONFIGURATIONS</div>
              <a href="#" onClick={(e) => { e.preventDefault(); setActive('Notifications') }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 10px', borderRadius: 8, color: active === 'Notifications' ? '#0f172a' : '#475569', textDecoration: 'none', background: active === 'Notifications' ? '#eef2f7' : 'transparent' }}>Notifications</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActive('Devices Setting') }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 10px', borderRadius: 8, color: active === 'Devices Setting' ? '#0f172a' : '#475569', textDecoration: 'none', background: active === 'Devices Setting' ? '#eef2f7' : 'transparent' }}>Devices Setting</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActive('Dashboard Setting') }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 10px', borderRadius: 8, color: active === 'Dashboard Setting' ? '#0f172a' : '#475569', textDecoration: 'none', background: active === 'Dashboard Setting' ? '#eef2f7' : 'transparent' }}>Dashboard Setting</a>
            </div>

            <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>USER SUPPORTS</div>
              <a href="#" onClick={(e) => { e.preventDefault(); setActive('Products Info') }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 10px', borderRadius: 8, color: active === 'Products Info' ? '#0f172a' : '#475569', textDecoration: 'none', background: active === 'Products Info' ? '#eef2f7' : 'transparent' }}>Products Info</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActive('Support Tickets') }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 10px', borderRadius: 8, color: active === 'Support Tickets' ? '#0f172a' : '#475569', textDecoration: 'none', background: active === 'Support Tickets' ? '#eef2f7' : 'transparent' }}>Support Tickets</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActive('User Feedback') }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 10px', borderRadius: 8, color: active === 'User Feedback' ? '#0f172a' : '#475569', textDecoration: 'none', background: active === 'User Feedback' ? '#eef2f7' : 'transparent' }}>User Feedback</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActive('Help & Docs') }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 10px', borderRadius: 8, color: active === 'Help & Docs' ? '#0f172a' : '#475569', textDecoration: 'none', background: active === 'Help & Docs' ? '#eef2f7' : 'transparent' }}>Help & Docs</a>
            </div>

            <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActive('User Profile') }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 10px', borderRadius: 8, color: active === 'User Profile' ? '#0f172a' : '#475569', textDecoration: 'none', background: active === 'User Profile' ? '#eef2f7' : 'transparent' }}>User Profile</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActive('Logout') }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 10px', borderRadius: 8, color: '#ef4444', textDecoration: 'none', fontWeight: 700 }}>Logout</a>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            {active === 'Overview' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Devices Overview</h1>
                    <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>Filter by role:</div>
                      <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>
                        <option>All Devices</option>
                        <option>Gateway</option>
                        <option>Meter</option>
                      </select>
                      <div style={{ color: '#6b7280' }}>({filtered.length} devices)</div>
                    </div>
                  </div>

                  <div>
                    <a href="/sites" style={{ padding: '8px 12px', background: '#06b6d4', color: 'white', borderRadius: 8, textDecoration: 'none' }}>Back to sites</a>
                  </div>
                </div>

                {loading ? (
                  <div style={{ padding: 40, background: 'white', borderRadius: 12 }}>Loading…</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    {filtered.map(r => (
                      <DeviceCard key={r.id} r={r} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              renderActiveContent()
            )}
          </div>
        </main>

      </div>
    </div>
  )
}

