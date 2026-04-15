"use client"
import React, { useEffect } from 'react'
import ListPage from "../../shared/ListPage"
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  const selectMode = searchParams?.get('select') === '1'

  function handleSelect(row: any) {
    try {
      if (window.opener && typeof window.opener.postMessage === 'function') {
        window.opener.postMessage({ type: 'k-system-invoice-selected', invoice: row }, '*')
        window.close()
      } else {
        // fallback: store selection in localStorage
        localStorage.setItem('k_system_selected_invoice', JSON.stringify(row))
        alert('Selected invoice saved to localStorage')
      }
    } catch (e) {
      console.error('Failed to send selected invoice', e)
    }
  }

  useEffect(() => {
    if (!selectMode) return
    const handler = (e: Event) => {
      try {
        const row = (e as any)?.detail || (e as any)?.data || null
        if (row) handleSelect(row)
      } catch (err) { console.error(err) }
    }
    window.addEventListener('k-system-list-select', handler)
    return () => { window.removeEventListener('k-system-list-select', handler) }
  }, [selectMode])

  return (
    <ListPage
      title="Korea HQ Invoices for Thailand"
      apiPath="/api/korea-invoices?branch=thailand&status=all"
      createPath="/KR-Thailand/Admin-Login/invoices/create"
      columns={[
        { key: 'invoiceNumber', label: 'Invoice No' },
        { key: 'issueDate', label: 'Issue Date' },
        { key: 'dueDate', label: 'Due Date' },
        { key: 'totalAmount', label: 'Total (USD)' },
        { key: 'paymentStatus', label: 'Status' }
      ]}
      print={{ path: '/Korea/Admin-Login/invoices/print', paramName: 'id', idKey: 'id', newTab: true }}
      link={{ columnKey: 'invoiceNumber', path: '/Korea/Admin-Login/invoices/print', paramName: 'id', idKey: 'id' }}
      selectable={selectMode}
    />
  )
}
