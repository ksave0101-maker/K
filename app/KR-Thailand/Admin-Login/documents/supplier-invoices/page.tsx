"use client"

import ListPage from '../../shared/ListPage'

export default function SupplierInvoicesListPage() {
  return (
    <ListPage
      title="Supplier Invoices"
      apiPath="/api/supplier-invoices"
      createPath="/KR-Thailand/Admin-Login/documents/supplier-invoices/create"
      columns={[
        { key: 'siNo', label: 'SI No.' },
        { key: 'siDate', label: 'Date' },
        { key: 'supplier_name', label: 'Supplier' },
        { key: 'supplier_invoice_no', label: 'Supplier Invoice' },
        { key: 'total_amount', label: 'Total Amount' },
        { key: 'due_date', label: 'Due Date' },
        { key: 'status', label: 'Status' }
      ]}
      print={{ path: '/KR-Thailand/Admin-Login/supplier-invoices/print', paramName: 'siNo', idKey: 'siID', newTab: true }}
    />
  )
}
